import { RowItem, Cell, SignatureItem, SelectableItem, ComponentType } from "../types";
import { arrayMove } from "@dnd-kit/sortable";

export function findItem(rows: RowItem[], id: string): SelectableItem | null {
  if (!id) return null;
  for (const row of rows) {
    if (row.id === id) return row;
    for (const cell of row.cells) {
      if (cell.id === id) return cell;
      for (const item of cell.items) {
        if (item.id === id) return item;
      }
    }
  }
  return null;
}

export function findContainerId(rows: RowItem[], id: string): string | null {
  for (const row of rows) {
    if (row.id === id) return 'root';
    for (const cell of row.cells) {
        if (cell.id === id) return cell.id; // It's a container itself
        if (cell.items.some(item => item.id === id)) {
            return cell.id;
        }
    }
  }
  return 'root'; // Default to root if not found inside anything
}


export function removeItem(rows: RowItem[], id: string): [RowItem[], SelectableItem | null] {
    let foundItem: SelectableItem | null = null;
    
    // Check if the ID belongs to a row first.
    const rowIndex = rows.findIndex(r => r.id === id);
    if (rowIndex > -1) {
        foundItem = rows[rowIndex];
        const newRows = [...rows];
        newRows.splice(rowIndex, 1);
        return [newRows, foundItem];
    }

    // If not a row, it could be a cell or a component inside a cell.
    // We map over rows to find the target and return an updated row.
    let itemFound = false;
    const mappedRows = rows.map(row => {
        // Optimization: if we already found and processed the item, don't do more work.
        if (itemFound) return row;

        // Check if the ID belongs to a cell within this row.
        const cellIndex = row.cells.findIndex(c => c.id === id);
        if (cellIndex > -1) {
            foundItem = row.cells[cellIndex];
            itemFound = true;
            const newCells = [...row.cells];
            newCells.splice(cellIndex, 1);
            return { ...row, cells: newCells };
        }

        // If not a cell, check if it's a component inside one of the cells.
        let componentFoundInCell = false;
        const newCellsAfterComponentRemoval = row.cells.map(cell => {
            if (componentFoundInCell) return cell;
            const itemIndex = cell.items.findIndex(i => i.id === id);
            if (itemIndex > -1) {
                foundItem = cell.items[itemIndex];
                componentFoundInCell = true;
                itemFound = true;
                const newItems = [...cell.items];
                newItems.splice(itemIndex, 1);
                return { ...cell, items: newItems };
            }
            return cell;
        });

        if (componentFoundInCell) {
            return { ...row, cells: newCellsAfterComponentRemoval };
        }

        // If nothing was found in this row, return it as is.
        return row;
    });

    // If an item was found (either a cell or a component)...
    if (itemFound) {
        // ...filter out any rows that may have become empty after a cell deletion.
        const finalRows = mappedRows.filter(row => row.cells.length > 0);
        return [finalRows, foundItem];
    }
    
    // If we've gone through everything and found nothing, return the original data.
    return [rows, null];
}

export function insertItem(rows: RowItem[], itemToInsert: SelectableItem, overId: string): RowItem[] {
    // Case 1: Inserting a new Row
    if (itemToInsert.type === ComponentType.Row) {
        const overIndex = rows.findIndex(r => r.id === overId);
        if (overIndex > -1) {
            const newRows = [...rows];
            newRows.splice(overIndex + 1, 0, itemToInsert as RowItem);
            return newRows;
        }
        return [...rows, itemToInsert as RowItem]; // Add to end if not over specific row
    }

    // Case 2: Inserting a component
    const item = itemToInsert as SignatureItem;

    // Find which cell to insert into
    let targetCellId: string | null = null;
    const overItem = findItem(rows, overId);

    if (overId === 'root' && rows.length > 0) {
        targetCellId = rows[0].cells[0].id;
    } else if (overItem?.type === 'row') {
        targetCellId = (overItem as RowItem).cells[0]?.id || null;
    } else {
        targetCellId = findContainerId(rows, overId);
    }

    if (!targetCellId) return rows; // Cannot determine where to insert

    return rows.map(row => ({
        ...row,
        cells: row.cells.map(cell => {
            if (cell.id === targetCellId) {
                const overIndex = cell.items.findIndex(i => i.id === overId);
                const newItems = [...cell.items];
                if (overIndex > -1) {
                    newItems.splice(overIndex, 0, item);
                } else {
                    newItems.push(item);
                }
                return { ...cell, items: newItems };
            }
             // Handle case where overId is the cell itself (empty cell)
            if (cell.id === overId) {
                return {...cell, items: [item, ...cell.items]}
            }
            return cell;
        })
    }));
}

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
            return item;
          }),
        };
      }),
    };
  });
}