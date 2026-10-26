type Result = "saved" | "failed";

const listeners = new Set<(result: Result) => void>();

function report(result: Result) {
  for (const listener of listeners) listener(result);
}

export function watchSaves(listener: (result: Result) => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export async function persist<T>(work: () => Promise<T>): Promise<T> {
  try {
    const value = await work();
    report("saved");
    return value;
  } catch (error) {
    report("failed");
    throw error;
  }
}
