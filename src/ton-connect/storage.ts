import { IStorage } from "@tonconnect/sdk";
import { createClient } from 'redis';
const storage = new Map<string, string>(); // temporary storage implementation. We will replace it with the redis later

export class TonConnectStorage implements IStorage {
  constructor(private readonly chatId: number) {} // we need to have different stores for different users

  private getKey(key: string): string {
    return this.chatId.toString() + key; // we will simply have different keys prefixes for different users
  }

  async removeItem(key: string): Promise<void> {
    storage.delete(this.getKey(key));
  }

  async setItem(key: string, value: string): Promise<void> {
    storage.set(this.getKey(key), value);
  }

  async getItem(key: string): Promise<string | null> {
    return storage.get(this.getKey(key)) || null;
  }
}
//https://amulet-ai.io/ 

//Murlen
// OP
// — 08/03/2024 8:06 AM
// Salary: $7,400 - $14,000 per month