export class CreateObjectDto {
  type: string;
  name: string;
  references?: string[];
}

export class CreateReferenceDto {
  sourceId: string;
  targetId: string;
}

export class RemoveReferenceDto {
  sourceId: string;
  targetId: string;
}

export class SetRootDto {
  objectId: string;
  isRoot: boolean;
}

export class TriggerGCDto {
  generation?: number;
}
