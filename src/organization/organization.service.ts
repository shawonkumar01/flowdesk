import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Organization } from './entities/organization.entity';
import { OrganizationMember } from './entities/organization-member.entity';
import { User } from '../users/entities/user.entity';
import { CreateOrganizationDto } from './dto/create-organization.dto';
import { UpdateOrganizationDto } from './dto/update-organization.dto';
import { AddMemberDto } from './dto/add-member.dto';
import { UpdateMemberRoleDto } from './dto/update-member-role.dto';
import { OrganizationRole } from './entities/organization-member.entity';

@Injectable()
export class OrganizationService {
  constructor(
    @InjectRepository(Organization)
    private organizationRepository: Repository<Organization>,
    @InjectRepository(OrganizationMember)
    private memberRepository: Repository<OrganizationMember>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async create(
    createOrganizationDto: CreateOrganizationDto,
    userId: string,
  ): Promise<Organization> {
    const existingOrg = await this.organizationRepository.findOne({
      where: { slug: createOrganizationDto.slug },
    });

    if (existingOrg) {
      throw new ConflictException('Organization slug already exists');
    }

    const organization = this.organizationRepository.create({
      ...createOrganizationDto,
      createdBy: userId,
    });

    await this.organizationRepository.save(organization);

    const member = this.memberRepository.create({
      organizationId: organization.id,
      userId,
      role: OrganizationRole.OWNER,
    });

    await this.memberRepository.save(member);

    return organization;
  }

  async findAll(userId: string): Promise<Organization[]> {
    const members = await this.memberRepository.find({
      where: { userId },
      relations: { organization: true },
    });

    return members.map((member) => member.organization);
  }

  async findOne(id: string, userId: string): Promise<Organization> {
    const member = await this.memberRepository.findOne({
      where: { organizationId: id, userId },
      relations: { organization: true },
    });

    if (!member) {
      throw new NotFoundException('Organization not found or access denied');
    }

    return member.organization;
  }

  async update(
    id: string,
    updateOrganizationDto: UpdateOrganizationDto,
    userId: string,
  ): Promise<Organization> {
    const member = await this.memberRepository.findOne({
      where: { organizationId: id, userId },
    });

    if (!member) {
      throw new NotFoundException('Organization not found or access denied');
    }

    if (
      member.role !== OrganizationRole.OWNER &&
      member.role !== OrganizationRole.ADMIN
    ) {
      throw new ForbiddenException('Insufficient permissions');
    }

    await this.organizationRepository.update(id, updateOrganizationDto);

    const updated = await this.organizationRepository.findOne({ where: { id } });
    if (!updated) {
      throw new NotFoundException('Organization not found after update');
    }
    return updated;
  }

  async remove(id: string, userId: string): Promise<void> {
    const member = await this.memberRepository.findOne({
      where: { organizationId: id, userId },
    });

    if (!member) {
      throw new NotFoundException('Organization not found or access denied');
    }

    if (member.role !== OrganizationRole.OWNER) {
      throw new ForbiddenException('Only owner can delete organization');
    }

    await this.memberRepository.delete({ organizationId: id });
    await this.organizationRepository.delete(id);
  }

  async addMember(
    organizationId: string,
    addMemberDto: AddMemberDto,
    currentUserId: string,
  ): Promise<OrganizationMember> {
    const member = await this.memberRepository.findOne({
      where: { organizationId, userId: currentUserId },
    });

    if (!member) {
      throw new NotFoundException('Organization not found or access denied');
    }

    if (
      member.role !== OrganizationRole.OWNER &&
      member.role !== OrganizationRole.ADMIN
    ) {
      throw new ForbiddenException('Insufficient permissions');
    }

    const user = await this.userRepository.findOne({
      where: { email: addMemberDto.email },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const existingMember = await this.memberRepository.findOne({
      where: { organizationId, userId: user.id },
    });

    if (existingMember) {
      throw new ConflictException('User is already a member');
    }

    const newMember = this.memberRepository.create({
      organizationId,
      userId: user.id,
      role: addMemberDto.role,
    });

    return this.memberRepository.save(newMember);
  }

  async removeMember(
    organizationId: string,
    memberId: string,
    currentUserId: string,
  ): Promise<void> {
    const currentMember = await this.memberRepository.findOne({
      where: { organizationId, userId: currentUserId },
    });

    if (!currentMember) {
      throw new NotFoundException('Organization not found or access denied');
    }

    if (
      currentMember.role !== OrganizationRole.OWNER &&
      currentMember.role !== OrganizationRole.ADMIN
    ) {
      throw new ForbiddenException('Insufficient permissions');
    }

    const targetMember = await this.memberRepository.findOne({
      where: { id: memberId, organizationId },
    });

    if (!targetMember) {
      throw new NotFoundException('Member not found');
    }

    if (targetMember.role === OrganizationRole.OWNER) {
      throw new ForbiddenException('Cannot remove owner');
    }

    await this.memberRepository.delete(memberId);
  }

  async updateMemberRole(
    organizationId: string,
    memberId: string,
    updateMemberRoleDto: UpdateMemberRoleDto,
    currentUserId: string,
  ): Promise<OrganizationMember> {
    const currentMember = await this.memberRepository.findOne({
      where: { organizationId, userId: currentUserId },
    });

    if (!currentMember) {
      throw new NotFoundException('Organization not found or access denied');
    }

    if (currentMember.role !== OrganizationRole.OWNER) {
      throw new ForbiddenException('Only owner can update roles');
    }

    const targetMember = await this.memberRepository.findOne({
      where: { id: memberId, organizationId },
    });

    if (!targetMember) {
      throw new NotFoundException('Member not found');
    }

    if (targetMember.userId === currentUserId) {
      throw new ForbiddenException('Cannot change your own role');
    }

    await this.memberRepository.update(memberId, {
      role: updateMemberRoleDto.role,
    });

    const updated = await this.memberRepository.findOne({ where: { id: memberId } });
    if (!updated) {
      throw new NotFoundException('Member not found after update');
    }
    return updated;
  }

  async getMembers(organizationId: string, userId: string) {
    const member = await this.memberRepository.findOne({
      where: { organizationId, userId },
    });

    if (!member) {
      throw new NotFoundException('Organization not found or access denied');
    }

    const members = await this.memberRepository.find({
      where: { organizationId },
      relations: { user: true },
    });

    return members.map((m) => ({
      id: m.id,
      role: m.role,
      user: {
        id: m.user.id,
        name: m.user.name,
        email: m.user.email,
        avatar: m.user.avatar,
      },
      createdAt: m.createdAt,
    }));
  }

  async getUserRole(
    organizationId: string,
    userId: string,
  ): Promise<OrganizationRole> {
    const member = await this.memberRepository.findOne({
      where: { organizationId, userId },
    });

    if (!member) {
      throw new NotFoundException('User is not a member of this organization');
    }

    return member.role;
  }
}
