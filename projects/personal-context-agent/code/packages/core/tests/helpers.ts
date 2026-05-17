import { tmpdir } from "node:os";
import { mkdtempSync, rmSync } from "node:fs";
import { join } from "node:path";
import { openStore, type Store } from "../src/index.ts";

export function withTempStore(): { store: Store; cleanup: () => void; dbPath: string } {
  const dir = mkdtempSync(join(tmpdir(), "pca-test-"));
  const dbPath = join(dir, "store.db");
  const store = openStore(dbPath);
  return {
    store,
    dbPath,
    cleanup: () => {
      store.close();
      rmSync(dir, { recursive: true, force: true });
    },
  };
}
