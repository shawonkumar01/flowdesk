import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Invitation, InvitationStatus } from './entities/invitation.entity';
import { OrganizationMember } from '../organization/entities/organization-member.entity';
import { User } from '../users/entities/user.entity';
import { CreateInvitationDto } from './dto/create-invitation.dto';
import * as crypto from 'crypto';

@Injectable()
export class InvitationsService {
  constructor(
    @InjectRepository(Invitation)
    private invitationRepository: Repository<Invitation>,
    @InjectRepository(OrganizationMember)
    private memberRepository: Repository<OrganizationMember>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async create(
    createInvitationDto: CreateInvitationDto,
    organizationId: string,
    userId: string,
  ): Promise<Invitation> {
    const member = await this.memberRepository.findOne({
      where: { organizationId, userId },
    });

    if (!member) {
      throw new ForbiddenException('Access denied');
    }

    const existingUser = await this.userRepository.findOne({
      where: { email: createInvitationDto.email },
    });

    if (existingUser) {
      const existingMember = await this.memberRepository.findOne({
        where: { organizationId, userId: existingUser.id },
      });

      if (existingMember) {
        throw new ConflictException('User is already a member of this organization');
      }
    }

    const existingInvitation = await this.invitationRepository.findOne({
      where: {
        organizationId,
        email: createInvitationDto.email,
        status: InvitationStatus.PENDING,
      },
    });

    if (existingInvitation) {
      throw new ConflictException('Invitation already sent to this email');
    }

    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    const invitation = this.invitationRepository.create({
      organizationId,
      email: createInvitationDto.email,
      role: createInvitationDto.role as any,
      token,
      expiresAt,
      invitedBy: userId,
    });

    return this.invitationRepository.save(invitation);
  }

  async findAll(organizationId: string, userId: string) {
    const member = await this.memberRepository.findOne({
      where: { organizationId, userId },
    });

    if (!member) {
      throw new ForbiddenException('Access denied');
    }

    return this.invitationRepository.find({
      where: { organizationId },
      order: { createdAt: 'DESC' },
    });
  }

  async accept(token: string, userId: string) {
    const invitation = await this.invitationRepository.findOne({
      where: { token, status: InvitationStatus.PENDING },
    });

    if (!invitation) {
      throw new NotFoundException('Invalid or expired invitation');
    }

    if (invitation.expiresAt < new Date()) {
      await this.invitationRepository.update(invitation.id, { status: InvitationStatus.EXPIRED });
      throw new NotFoundException('Invitation has expired');
    }

    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.email !== invitation.email) {
      throw new ForbiddenException('This invitation is not for your email');
    }

    const existingMember = await this.memberRepository.findOne({
      where: { organizationId: invitation.organizationId, userId },
    });

    if (existingMember) {
      await this.invitationRepository.update(invitation.id, { status: InvitationStatus.ACCEPTED });
      throw new ConflictException('You are already a member of this organization');
    }

    const newMember = this.memberRepository.create({
      organizationId: invitation.organizationId,
      userId,
      role: invitation.role,
    });

    await this.memberRepository.save(newMember);
    await this.invitationRepository.update(invitation.id, { status: InvitationStatus.ACCEPTED });

    return { message: 'Invitation accepted successfully' };
  }

  async decline(token: string, userId: string) {
    const invitation = await this.invitationRepository.findOne({
      where: { token, status: InvitationStatus.PENDING },
    });

    if (!invitation) {
      throw new NotFoundException('Invalid invitation');
    }

    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.email !== invitation.email) {
      throw new ForbiddenException('This invitation is not for your email');
    }

    await this.invitationRepository.update(invitation.id, { status: InvitationStatus.DECLINED });

    return { message: 'Invitation declined' };
  }

  async remove(id: string, organizationId: string, userId: string) {
    const member = await this.memberRepository.findOne({
      where: { organizationId, userId },
    });

    if (!member) {
      throw new ForbiddenException('Access denied');
    }

    const invitation = await this.invitationRepository.findOne({
      where: { id, organizationId },
    });

    if (!invitation) {
      throw new NotFoundException('Invitation not found');
    }

    await this.invitationRepository.delete(id);
  }
}
