import { Controller, Get, Post, Body, Param, Delete } from '@nestjs/common';
import { GcService } from './gc.service';
import {
  CreateObjectDto,
  CreateReferenceDto,
  RemoveReferenceDto,
  SetRootDto,
  TriggerGCDto,
} from './dto/gc.dto';

@Controller('api/gc')
export class GcController {
  constructor(private readonly gcService: GcService) {}

  /**
   * Get current GC state
   */
  @Get('state')
  getState() {
    return this.gcService.getState();
  }

  /**
   * Reset the GC state
   */
  @Post('reset')
  reset() {
    return this.gcService.reset();
  }

  /**
   * Create a new object
   */
  @Post('objects')
  createObject(@Body() dto: CreateObjectDto) {
    return this.gcService.createObject(dto);
  }

  /**
   * Create a reference between objects
   */
  @Post('references')
  createReference(@Body() dto: CreateReferenceDto) {
    this.gcService.createReference(dto);
    return { success: true };
  }

  /**
   * Remove a reference between objects
   */
  @Delete('references')
  removeReference(@Body() dto: RemoveReferenceDto) {
    this.gcService.removeReference(dto);
    return { success: true };
  }

  /**
   * Set or unset an object as a root
   */
  @Post('roots')
  setRoot(@Body() dto: SetRootDto) {
    this.gcService.setRoot(dto);
    return { success: true };
  }

  /**
   * Trigger garbage collection
   */
  @Post('collect')
  triggerGC(@Body() dto: TriggerGCDto) {
    const generation = dto.generation ?? 0;
    const steps = this.gcService.triggerGC(generation);
    return { steps, state: this.gcService.getState() };
  }

  /**
   * Get all steps
   */
  @Get('steps')
  getSteps() {
    return this.gcService.getSteps();
  }

  /**
   * Get a specific step
   */
  @Get('steps/:stepNumber')
  getStep(@Param('stepNumber') stepNumber: string) {
    return this.gcService.getStep(parseInt(stepNumber, 10));
  }
}
