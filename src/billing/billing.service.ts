import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import Stripe from 'stripe';
import { Subscription, Plan, SubscriptionStatus } from './entities/subscription.entity';
import { OrganizationMember } from '../organization/entities/organization-member.entity';
import { CreateSubscriptionDto } from './dto/create-subscription.dto';
import { UpdateSubscriptionDto } from './dto/update-subscription.dto';

@Injectable()
export class BillingService {
  private readonly stripe: Stripe;

  constructor(
    @InjectRepository(Subscription)
    private subscriptionRepository: Repository<Subscription>,
    @InjectRepository(OrganizationMember)
    private memberRepository: Repository<OrganizationMember>,
  ) {
    this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
      apiVersion: '2024-06-20',
    } as any);
  }

  async create(
    createSubscriptionDto: CreateSubscriptionDto,
    organizationId: string,
    userId: string,
  ): Promise<Subscription> {
    const member = await this.memberRepository.findOne({
      where: { organizationId, userId },
    });

    if (!member) {
      throw new BadRequestException('Access denied');
    }

    const existingSubscription = await this.subscriptionRepository.findOne({
      where: { organizationId },
    });

    if (existingSubscription) {
      throw new BadRequestException('Subscription already exists');
    }

    let stripeCustomerId = createSubscriptionDto.stripeCustomerId;

    if (!stripeCustomerId) {
      const customer = await this.stripe.customers.create({
        metadata: { organizationId },
      });
      stripeCustomerId = customer.id;
    }

    const priceId = this.getPriceIdForPlan(createSubscriptionDto.plan);

    let stripeSubscriptionId: string | null = null;

    if (createSubscriptionDto.paymentMethodId) {
      const subscription = await this.stripe.subscriptions.create({
        customer: stripeCustomerId,
        items: [{ price: priceId }],
        payment_behavior: 'default_incomplete',
        payment_settings: { save_default_payment_method: 'on_subscription' },
        expand: ['latest_invoice.payment_intent'],
      });
      stripeSubscriptionId = subscription.id;
    }

    const subscription = this.subscriptionRepository.create({
      organizationId,
      plan: createSubscriptionDto.plan,
      stripeCustomerId,
      stripeSubscriptionId: stripeSubscriptionId || undefined,
      status: stripeSubscriptionId ? SubscriptionStatus.ACTIVE : SubscriptionStatus.TRIALING,
    });

    return this.subscriptionRepository.save(subscription);
  }

  async findOne(organizationId: string, userId: string) {
    const member = await this.memberRepository.findOne({
      where: { organizationId, userId },
    });

    if (!member) {
      throw new BadRequestException('Access denied');
    }

    const subscription = await this.subscriptionRepository.findOne({
      where: { organizationId },
    });

    if (!subscription) {
      throw new NotFoundException('Subscription not found');
    }

    return subscription;
  }

  async update(
    organizationId: string,
    updateSubscriptionDto: UpdateSubscriptionDto,
    userId: string,
  ) {
    const member = await this.memberRepository.findOne({
      where: { organizationId, userId },
    });

    if (!member) {
      throw new BadRequestException('Access denied');
    }

    const subscription = await this.subscriptionRepository.findOne({
      where: { organizationId },
    });

    if (!subscription) {
      throw new NotFoundException('Subscription not found');
    }

    if (updateSubscriptionDto.plan && updateSubscriptionDto.plan !== subscription.plan) {
      const priceId = this.getPriceIdForPlan(updateSubscriptionDto.plan);

      if (subscription.stripeSubscriptionId) {
        await this.stripe.subscriptions.update(subscription.stripeSubscriptionId, {
          items: [{ price: priceId }],
        });
      }

      subscription.plan = updateSubscriptionDto.plan;
    }

    return this.subscriptionRepository.save(subscription);
  }

  async cancel(organizationId: string, userId: string) {
    const member = await this.memberRepository.findOne({
      where: { organizationId, userId },
    });

    if (!member) {
      throw new BadRequestException('Access denied');
    }

    const subscription = await this.subscriptionRepository.findOne({
      where: { organizationId },
    });

    if (!subscription) {
      throw new NotFoundException('Subscription not found');
    }

    if (subscription.stripeSubscriptionId) {
      await this.stripe.subscriptions.cancel(subscription.stripeSubscriptionId);
    }

    subscription.status = SubscriptionStatus.CANCELLED;
    return this.subscriptionRepository.save(subscription);
  }

  private getPriceIdForPlan(plan: Plan): string {
    const priceMap = {
      [Plan.PRO]: process.env.STRIPE_PRO_PRICE_ID || '',
      [Plan.ENTERPRISE]: process.env.STRIPE_ENTERPRISE_PRICE_ID || '',
    };

    return priceMap[plan] || '';
  }
}
