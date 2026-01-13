
import { RowItem, Cell, SignatureItem, SelectableItem, ComponentType } from "../types";
import { arrayMove } from "@dnd-kit/sortable";

/**
 * Recursively find an item by ID within a list of RowItems (or nested items).
 */
export function findItem(rows: RowItem[], id: string): SelectableItem | null {
  if (!id) return null;
  
  for (const row of rows) {
    if (row.id === id) return row;
    
    // Check cells in the row
    for (const cell of row.cells) {
      if (cell.id === id) return cell;
      
      // Check items in the cell
      for (const item of cell.items) {
        if (item.id === id) return item;
        
        // Recursive check for nested containers (Row/Container)
        if (item.type === ComponentType.Row || item.type === ComponentType.Container) {
            const nestedRow = item as RowItem; // Container is structurally same as RowItem
            // We use a helper to check inside this nested row structure
            const result = findItemInStructure(nestedRow, id);
            if (result) return result;
        }
      }
    }
  }
  return null;
}

function findItemInStructure(row: RowItem, id: string): SelectableItem | null {
    if (row.id === id) return row;
    
    for (const cell of row.cells) {
        if (cell.id === id) return cell;
        
        for (const item of cell.items) {
            if (item.id === id) return item;
            
            if (item.type === ComponentType.Row || item.type === ComponentType.Container) {
                 const result = findItemInStructure(item as RowItem, id);
                 if (result) return result;
            }
        }
    }
    return null;
}

/**
 * Finds the immediate Sortable container ID for a given item ID.
 * - If item is a Row at root, returns 'root'.
 * - If item is inside a Cell, returns the Cell ID.
 * - Handles arbitrary nesting depth.
 */
export function findContainerId(rows: RowItem[], id: string): string | null {
    // 1. Check if it's a root row
    if (rows.some(r => r.id === id)) return 'root';

    // 2. Recursive search
    let foundContainer: string | null = null;

    const traverse = (items: SignatureItem[], containerId: string) => {
        if (foundContainer) return;

        for (const item of items) {
            if (item.id === id) {
                foundContainer = containerId;
                return;
            }
            
            // If item is a container itself (Row/Container), traverse its cells
            if (item.type === ComponentType.Row || item.type === ComponentType.Container) {
                const nestedRow = item as RowItem;
                for (const cell of nestedRow.cells) {
                    if (cell.id === id) {
                        foundContainer = nestedRow.id; // The cell is inside this row/container
                        return;
                    }
                    // Recursively check inside the cell. The cell IS the container for its items.
                    traverse(cell.items, cell.id);
                }
            }
        }
    };

    // Start traversal from root rows
    for (const row of rows) {
        for (const cell of row.cells) {
            if (cell.id === id) return row.id; // Cell is directly inside a root row
            traverse(cell.items, cell.id);
        }
    }

    return foundContainer;
}

/**
 * Recursively removes an item by ID from the tree.
 */
export function removeItem(rows: RowItem[], id: string): [RowItem[], SelectableItem | null] {
    let foundItem: SelectableItem | null = null;
    
    const remove = (currentRows: RowItem[]): RowItem[] => {
        return currentRows.map(row => {
            if (row.id === id) {
                foundItem = row;
                return null;
            }

            const newCells = row.cells.map(cell => {
                if (cell.id === id) {
                    foundItem = cell;
                    return null; // Cell removal usually handled by logic in PropertiesPanel, but supported here
                }
                
                const newItems = cell.items.map(item => {
                    if (item.id === id) {
                        foundItem = item;
                        return null;
                    }
                    
                    if (item.type === ComponentType.Row || item.type === ComponentType.Container) {
                        const [updatedNestedRows, nestedFound] = removeItem([item as RowItem], id);
                        if (nestedFound) {
                            foundItem = nestedFound;
                            return updatedNestedRows.length > 0 ? updatedNestedRows[0] : null; 
                        }
                        return item;
                    }
                    return item;
                }).filter((i): i is SignatureItem => i !== null);

                return { ...cell, items: newItems };
            }).filter((c): c is Cell => c !== null);

            return { ...row, cells: newCells };
        }).filter((r): r is RowItem => r !== null);
    };

    const newRows = remove(rows);
    return [newRows, foundItem];
}

/**
 * Recursively inserts an item into the tree.
 * - If `overId` is 'root', inserts at top level.
 * - If `overId` is a Cell ID, inserts into that Cell.
 * - If `overId` is an Item ID, inserts adjacent to that Item.
 */
export function insertItem(rows: RowItem[], itemToInsert: SelectableItem, overId: string): RowItem[] {
    const item = itemToInsert as SignatureItem;
    
    // 1. Insert at Root Level
    if (overId === 'root') {
        if (item.type === ComponentType.Row || item.type === ComponentType.Container) {
             return [...rows, item as RowItem];
        }
        // If strict, we might restrict non-rows at root, but for now we allow wrapping them or they might just fail to render
        // Actually, the Canvas usually expects Rows at root.
        // We'll wrap it in a default Row for safety if it's not a Row/Container
        // But let's assume the caller knows what they are doing or the Canvas handles it.
        // For 'SignatureBuilder', root items are Rows.
        return rows; 
    }
    
    // 2. Recursive Insertion
    const insert = (currentRows: RowItem[]): RowItem[] => {
        return currentRows.map(row => {
            // Check if we are inserting next to this row (if overId is a rowId)
            // This is usually handled by `arrayMove` in the sorting logic, 
            // but for new insertions:
            if (row.id === overId) {
                // Return generic logic? Map cannot return array. 
                // We handle adjacency insertion at the *parent* level usually.
                // But for `insertItem` utility called from dragEnd, we often look inside.
            }

            const newCells = row.cells.map(cell => {
                // Case A: Dropped directly onto a Cell (e.g. empty cell)
                if (cell.id === overId) {
                    return { ...cell, items: [...cell.items, item] };
                }

                // Case B: Dropped onto an item inside this cell
                const index = cell.items.findIndex(i => i.id === overId);
                if (index !== -1) {
                    const newItems = [...cell.items];
                    newItems.splice(index + 1, 0, item); // Insert after
                    return { ...cell, items: newItems };
                }
                
                // Case C: Recurse into nested rows/containers
                const newItems = cell.items.map(i => {
                    if (i.type === ComponentType.Row || i.type === ComponentType.Container) {
                        const updatedRows = insert([i as RowItem]);
                        return updatedRows[0];
                    }
                    return i;
                });
                
                return { ...cell, items: newItems };
            });

            return { ...row, cells: newCells };
        });
    };

    // If overId is a top-level row, we need to insert *after* it in the main array
    const overRowIndex = rows.findIndex(r => r.id === overId);
    if (overRowIndex > -1) {
        const newRows = [...rows];
        // Ensure we only insert Row/Container types at root for consistency
        if (item.type === ComponentType.Row || item.type === ComponentType.Container) {
             newRows.splice(overRowIndex + 1, 0, item as RowItem);
        }
        return newRows;
    }

    return insert(rows);
}

/**
 * Recursively update an item properties
 */
export function updateItem(rows: RowItem[], id: string, updates: Partial<SelectableItem>): RowItem[] {
  return rows.map(row => {
    if (row.id === id) {
      return { ...row, ...updates } as RowItem;
    }
    return {
      ...row,
      cells: row.cells.map(cell => {
        if (cell.id === id) {
          return { ...cell, ...updates } as Cell;
        }
        return {
          ...cell,
          items: cell.items.map(item => {
            if (item.id === id) {
              return { ...item, ...updates } as SignatureItem;
            }
            if (item.type === ComponentType.Row || item.type === ComponentType.Container) {
                const updatedRows = updateItem([item as RowItem], id, updates);
                return updatedRows[0];
            }
            return item;
          }),
        };
      }),
    };
  });
}
