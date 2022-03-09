import { IPluginAPI } from './PluginAPI.interface';

export enum PluginType {
   Encryption,
}

export enum PluginState {
   Enabled,
   Ready,
   Disabled,
}

export enum EncryptionState {
   Plaintext,
   VerifiedEncrypted,
   UnverifiedEncrypted,
   Ended,
}

export interface IMetaData {
   author?: string;
   description?: string;
   xeps?: IXEP[];
}

export interface IXEP {
   id: string;
   name: string;
   version: string;
}

export interface IPlugin {
   new (pluginAPI: IPluginAPI): AbstractPlugin;
   getId(): string;
   getName(): string;
   getMetaData(): IMetaData;
}

export abstract class AbstractPlugin {
   public static getId(): string {
      return null;
   }

   public static getName(): string {
      return null;
   }

   public static getMetaData(): IMetaData {
      return {};
   }

   constructor(protected minVersion: string, protected maxVersion: string, protected pluginAPI: IPluginAPI) {
   }

   public destroy() {}

   // @Review why?, how is the development of client version incompatible plugin versions planned?
   private isSupportingClientVersion(): boolean {
      const clientVersionNumber = this.getVersionNumber(this.pluginAPI.getVersion());
      const minVersionNumber = this.getVersionNumber(this.minVersion);
      const maxVersionNumber = this.getVersionNumber(this.maxVersion);

      return clientVersionNumber >= minVersionNumber && clientVersionNumber <= maxVersionNumber;
   }

   private getVersionNumber(version: string): number {
      const versions = version.split('.').map(v => parseInt(v, 10));

      return versions[0] * 1000000 + versions[1] * 1000 + versions[2];
   }
}