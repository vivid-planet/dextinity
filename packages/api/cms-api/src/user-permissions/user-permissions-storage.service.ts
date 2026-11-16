import { Injectable } from "@nestjs/common";
import { AsyncLocalStorage } from "async_hooks";

import type { UserPermissionsStorage } from "./user-permissions-storage.interface.js";

@Injectable()
export class UserPermissionsStorageService {
    private readonly storage = new AsyncLocalStorage<UserPermissionsStorage>();

    run(callback: () => void): void {
        return this.storage.run({} as UserPermissionsStorage, callback);
    }

    async runWith(store: UserPermissionsStorage, callback: () => void): Promise<void> {
        return this.storage.run(store, callback);
    }

    set<K extends keyof UserPermissionsStorage>(key: K, value: UserPermissionsStorage[K]): void {
        const store = this.storage.getStore();
        if (!store) {
            throw new Error("AsyncLocalStorage store is not initialized. Make sure to call set() within the context of run().");
        }
        store[key] = value;
    }

    get<K extends keyof UserPermissionsStorage>(key: K): UserPermissionsStorage[K] {
        const store = this.storage.getStore();
        if (!store) {
            throw new Error("AsyncLocalStorage store is not initialized. Make sure to call set() within the context of run().");
        }
        return store[key];
    }

    has(key: keyof UserPermissionsStorage): boolean {
        const store = this.storage.getStore();
        return !!store && key in store;
    }
}
