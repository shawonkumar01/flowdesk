import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotesService } from './notes.service';
import { NotesController } from './notes.controller';
import { Note } from './entities/note.entity';
import { OrganizationMember } from '../organization/entities/organization-member.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Note, OrganizationMember])],
  controllers: [NotesController],
  providers: [NotesService],
  exports: [NotesService],
})
export class NotesModule {}
