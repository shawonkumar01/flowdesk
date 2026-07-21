import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Note } from './entities/note.entity';
import { OrganizationMember } from '../organization/entities/organization-member.entity';
import { CreateNoteDto } from './dto/create-note.dto';
import { UpdateNoteDto } from './dto/update-note.dto';

@Injectable()
export class NotesService {
  constructor(
    @InjectRepository(Note)
    private noteRepository: Repository<Note>,
    @InjectRepository(OrganizationMember)
    private memberRepository: Repository<OrganizationMember>,
  ) {}

  async create(
    createNoteDto: CreateNoteDto,
    organizationId: string,
    userId: string,
  ): Promise<Note> {
    const member = await this.memberRepository.findOne({
      where: { organizationId, userId },
    });

    if (!member) {
      throw new ForbiddenException('Access denied');
    }

    const note = this.noteRepository.create({
      ...createNoteDto,
      organizationId,
      userId,
    });

    return this.noteRepository.save(note);
  }

  async findAll(organizationId: string, userId: string, customerId?: string) {
    const member = await this.memberRepository.findOne({
      where: { organizationId, userId },
    });

    if (!member) {
      throw new ForbiddenException('Access denied');
    }

    const where: any = { organizationId };

    if (customerId) {
      where.customerId = customerId;
    }

    return this.noteRepository.find({
      where,
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string, organizationId: string, userId: string) {
    const member = await this.memberRepository.findOne({
      where: { organizationId, userId },
    });

    if (!member) {
      throw new ForbiddenException('Access denied');
    }

    const note = await this.noteRepository.findOne({
      where: { id, organizationId },
    });

    if (!note) {
      throw new NotFoundException('Note not found');
    }

    return note;
  }

  async update(
    id: string,
    updateNoteDto: UpdateNoteDto,
    organizationId: string,
    userId: string,
  ) {
    const member = await this.memberRepository.findOne({
      where: { organizationId, userId },
    });

    if (!member) {
      throw new ForbiddenException('Access denied');
    }

    const note = await this.noteRepository.findOne({
      where: { id, organizationId },
    });

    if (!note) {
      throw new NotFoundException('Note not found');
    }

    await this.noteRepository.update(id, updateNoteDto);

    return this.noteRepository.findOne({ where: { id } });
  }

  async remove(id: string, organizationId: string, userId: string) {
    const member = await this.memberRepository.findOne({
      where: { organizationId, userId },
    });

    if (!member) {
      throw new ForbiddenException('Access denied');
    }

    const note = await this.noteRepository.findOne({
      where: { id, organizationId },
    });

    if (!note) {
      throw new NotFoundException('Note not found');
    }

    await this.noteRepository.delete(id);
  }
}
