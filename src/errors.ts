export class NonExistentMigrationError extends Error {
   constructor(initSequenceName: string) {
      super(`Migration sequence "${initSequenceName}" does not exist.`);
      Object.setPrototypeOf(this, NonExistentMigrationError.prototype);
   }
}
