import { SelectionModel } from "@angular/cdk/collections";
import { FlatTreeControl } from "@angular/cdk/tree";
import { Component, ElementRef, Injectable, OnInit, ViewChild } from "@angular/core";
import {
  MatTreeFlatDataSource,
  MatTreeFlattener
} from "@angular/material/tree";
import { BehaviorSubject } from "rxjs";
import { FormControl } from "@angular/forms";
import { Observable } from "rxjs";
import { map, startWith } from "rxjs/operators";
import * as cloneDeep from 'lodash/cloneDeep';
/**
 * Node for to-do item
 */
export class FoodNode {
  children?: FoodNode[];
  item: string;
 
}

/** Flat to-do item node with expandable and level information */
export class FoodFlatNode {
  item: string;
  level: number;
  expandable: boolean;
 
  
}

/**
 * The Json object for to-do list data.
 */
const TREE_DATA: FoodNode[] = [
  {
    item: "Fruit",
    children: [
      { item: "Apple" },
      { item: "Banana" },
      { item: "Pomegr" },
      { item: "Cherry" },
      { item: "Oranges" },
      {
        item: "Fruit loops"
        // children: [
        //   { item: "Cherry" },
        //   { item: "Grapes", children: [{ item: "Oranges" }] }
        // ]
      }
    ]
  },
  {
    item: "Vegetables",
    children: [
      { item: "Brussels sprouts" },
      {
        item: "Broccoli"
        // children: [{ item: "Broccoli" }, { item: "Brussels sprouts" }]
      },
      {
        item: "Pumpkins"
        //children: [{ item: "Pumpkins" }, { item: "Carrots" }]
      },
      { item: "Carrots" }
    ]
  }
];

/**
 * Checklist database, it can build a tree structured Json object.
 * Each node in Json object represents a to-do item or a category.
 * If a node is a category, it has children items and new items can be added under the category.
 */
@Injectable({ providedIn: "root" })
export class ChecklistDatabase {
  dataChange = new BehaviorSubject<FoodNode[]>([]);
  treeData: FoodNode[];
  searchString: string;
  public checklistSelection = new SelectionModel<FoodFlatNode>(true /* multiple */);
  public selectedCheckedItems: string[] = [];

  
  get data(): FoodNode[] {
    return this.dataChange.value;
  }
  get originalData() : FoodNode[] {
    return this.treeData;
  }
  constructor() {
    this.initialize();
  }

  initialize() {
    this.treeData = TREE_DATA;
    // Build the tree nodes from Json object. The result is a list of `TodoItemNode` with nested
    //     file node as children.
    const data = TREE_DATA;

    // Notify the change.
    this.dataChange.next(data);
  }
  public filterLodash(filterText: string) {
    if (filterText) {
      this.searchString = filterText;
      const clonedTreeLocal = cloneDeep(this.treeData);
      this.recursiveNodeEliminator(clonedTreeLocal);
      this.dataChange.next(clonedTreeLocal);
    } else {
      this.dataChange.next(this.treeData);
    }

  }
  recursiveNodeEliminator(tree: Array<FoodNode>): boolean {
    for (let index = tree.length - 1; index >= 0; index--) {
      const node = tree[index];
      if (node.children) {
        const parentCanBeEliminated = this.recursiveNodeEliminator(node.children);
        if (parentCanBeEliminated) {
          if (node.item.toLocaleLowerCase().indexOf(this.searchString.toLocaleLowerCase()) === -1) {
           tree.splice(index, 1);
           
          }
        }
      } else {
        // Its a leaf node. No more branches.
        if (node.item.toLocaleLowerCase().indexOf(this.searchString.toLocaleLowerCase()) === -1) {
          tree.splice(index, 1);
          
        }
      }
    }
    return tree.length === 0;
  }
  public filter(filterText: string) {
    let filteredTreeData;
    if (filterText) {
      // Filter the tree
      function filter(array, text) {
        const getChildren = (result, object) => {
          if (object.item.toLowerCase() === text.toLowerCase()) {
            result.push(object);
            return result;
          }
          if (Array.isArray(object.children)) {
            const children = object.children.reduce(getChildren, []);
            if (children.length) result.push({ ...object, children });
          }
          return result;
        };

        return array.reduce(getChildren, []);
      }

      filteredTreeData = filter(this.treeData, filterText);
    } else {
      // Return the initial tree
      filteredTreeData = this.treeData;
    }

    // Build the tree nodes from Json object. The result is a list of `TodoItemNode` with nested
    // file node as children.
    const data = filteredTreeData;
    // Notify the change.
    this.dataChange.next(data);
  }
}

@Component({
  selector: "chip-hierarchy",
  templateUrl: "chip-hierachy.component.html",
  styleUrls: ["chip-hierachy.component.css"],
  providers: [ChecklistDatabase]
})
export class ChipHierarchyComponent implements OnInit {
  @ViewChild('autocompleteInput') autocompleteInput: ElementRef;
  /** Map from flat node to nested node. This helps us finding the nested node to be modified */
  flatNodeMap = new Map<FoodFlatNode, FoodNode>();

  /** Map from nested node to flattened node. This helps us to keep the same object for selection */
  nestedNodeMap = new Map<FoodNode, FoodFlatNode>();

  /** A selected parent node to be inserted */
  selectedParent: FoodFlatNode | null = null;

  /** The new item's name */
  newItemName = "";

  treeControl: FlatTreeControl<FoodFlatNode>;

  treeFlattener: MatTreeFlattener<FoodNode, FoodFlatNode>;

  dataSource: MatTreeFlatDataSource<FoodNode, FoodFlatNode>;

  /** The selection for checklist */
  //checklistSelection = new SelectionModel<FoodFlatNode>(true /* multiple */);
  checklistSelection = new SelectionModel<FoodFlatNode>(true /* multiple */);
  selectedCheckedItems: string[];
  /// Filtering
  myControl = new FormControl();
  options: string[] = ["One", "Two", "Three"];
  filteredOptions: Observable<string[]>;
  selectedFruits: string[];
  constructor(private _database: ChecklistDatabase) {
    this.treeFlattener = new MatTreeFlattener(
      this.transformer,
      this.getLevel,
      this.isExpandable,
      this.getChildren
    );
    this.treeControl = new FlatTreeControl<FoodFlatNode>(
      this.getLevel,
      this.isExpandable
    );
    this.dataSource = new MatTreeFlatDataSource(
      this.treeControl,
      this.treeFlattener
    );

    _database.dataChange.subscribe(data => {
      this.dataSource.data = data;
    });
  }

  ngOnInit() {
    this.checklistSelection = this._database.checklistSelection;
    this.selectedCheckedItems = this._database.selectedCheckedItems;
  }


  getLevel = (node: FoodFlatNode) => node.level;

  isExpandable = (node: FoodFlatNode) => node.expandable;

  getChildren = (node: FoodNode): FoodNode[] => node.children;

  hasChild = (_: number, _nodeData: FoodFlatNode) => _nodeData.expandable;

  hasNoContent = (_: number, _nodeData: FoodFlatNode) => _nodeData.item === "";

  /**
   * Transformer to convert nested node to flat node. Record the nodes in maps for later use.
   */
  transformer = (node: FoodNode, level: number) => {
    const existingNode = this.nestedNodeMap.get(node);
    const flatNode =
      existingNode && existingNode.item === node.item
        ? existingNode
        : new FoodFlatNode();
    flatNode.item = node.item;
    flatNode.level = level;
    flatNode.expandable = !!node.children;
    this.flatNodeMap.set(flatNode, node);
    this.nestedNodeMap.set(node, flatNode);
    return flatNode;
  };

  /** Whether all the descendants of the node are selected. */
  descendantsAllSelected(node: FoodFlatNode): boolean {
    //const descendants = this.treeControl.getDescendants(node);
    const descendants = this._database.originalData
    .find(x => x.item ===  node.item)
     .children;
    const descAllSelected = descendants.every(child =>
      //this.checklistSelection.isSelected(child)
      this.selectedCheckedItems.indexOf(child.item) > -1
    );
    return descAllSelected;
  }

  /** Whether part of the descendants are selected */
  descendantsPartiallySelected(node: FoodFlatNode): boolean {
    //const descendants = this.treeControl.getDescendants(node);
    const descendants = this._database.originalData
                      .find(x => x.item ===  node.item)
                       .children;
    const result = descendants.some(child =>
      //this.checklistSelection.isSelected(child)
      this.selectedCheckedItems.indexOf(child.item) > -1
    );
    return result && !this.descendantsAllSelected(node);
  }

  /** Toggle the to-do item selection. Select/deselect all the descendants node */
  todoItemSelectionToggle(node: FoodFlatNode): void {
    //this.checklistSelection.toggle(node);
    if(this.selectedCheckedItems.indexOf(node.item) > -1) {
      this.selectedCheckedItems.splice(this.selectedCheckedItems.indexOf(node.item),1);
    }else {
      this.selectedCheckedItems.push(node.item);
    }
    //const descendants = this.treeControl.getDescendants(node);
    const descendants = this._database.originalData
    .find(x => x.item ===  node.item)
     .children;
    // this.checklistSelection.isSelected(node)
    //   ? this.checklistSelection.select(...descendants)
    //   : this.checklistSelection.deselect(...descendants);
    if(this.selectedCheckedItems.indexOf(node.item) > -1) {
      descendants.forEach(x => {
        if(! (this.selectedCheckedItems.indexOf(x.item) > -1)) {
          this.selectedCheckedItems.push(x.item);
        }
      })
    }else {
      descendants.forEach(x => {
        if(this.selectedCheckedItems.indexOf(x.item) > -1) {
          this.selectedCheckedItems.splice(this.selectedCheckedItems.indexOf(x.item),1);
        }
      });
    }
    // Force update for the parent
   // descendants.every(child => this.checklistSelection.isSelected(child));
   descendants.every(child => {
      this.selectedCheckedItems.indexOf(child.item) > -1 
   });
    this.checkAllParentsSelection(node);
    this.populateSelectedFruits();
  }

  /** Toggle a leaf to-do item selection. Check all the parents to see if they changed */
  todoLeafItemSelectionToggle(node: FoodFlatNode): void {
    //this.checklistSelection.toggle(node);
    if(this.selectedCheckedItems.indexOf(node.item) > -1) {
      this.selectedCheckedItems.splice(this.selectedCheckedItems.indexOf(node.item),1);
    }else {
      this.selectedCheckedItems.push(node.item);
    }
    this.checkAllParentsSelection(node);
    this.populateSelectedFruits();
  }

  /* Checks all the parents when a leaf node is selected/unselected */
  checkAllParentsSelection(node: FoodFlatNode): void {
    let parent: FoodFlatNode | null = this.getParentNode(node);
    while (parent) {
      this.checkRootNodeSelection(parent);
      parent = this.getParentNode(parent);
    }
  }

  /** Check root node checked state and change it accordingly */
  checkRootNodeSelection(node: FoodFlatNode): void {
    //const nodeSelected = this.checklistSelection.isSelected(node);
    const nodeSelected = this.selectedCheckedItems.indexOf(node.item) > -1
    //const descendants = this.treeControl.getDescendants(node);
    const descendants = this._database.originalData
    .find(x => x.item ===  node.item)
     .children;
    const descAllSelected = descendants.every(child =>
      //this.checklistSelection.isSelected(child)
      this.selectedCheckedItems.indexOf(child.item) > -1 
    );
    if (nodeSelected && !descAllSelected) {
      //this.checklistSelection.deselect(node);
      if(this.selectedCheckedItems.indexOf(node.item) > -1 ) {
        this.selectedCheckedItems.splice(this.selectedCheckedItems.indexOf(node.item),1);
      }
    } else if (!nodeSelected && descAllSelected) {
      //this.checklistSelection.select(node);
      if(! (this.selectedCheckedItems.indexOf(node.item) > -1) ) {
        this.selectedCheckedItems.push(node.item);
      }
    }
  }
  removeSelection(fruitName: string) {
    this.treeControl.dataNodes.forEach(x => {

      if (x.item === fruitName) {
        if (x.level === 0) {       
          this.todoItemSelectionToggle(x);
        } else {
          this.todoLeafItemSelectionToggle(x);
        }
        return;
      }
    });
    //this.populateSelectedFruits();
  }
  /* Get the parent node of a node */
  getParentNode(node: FoodFlatNode): FoodFlatNode | null {
    //console.log(this.checklistSelection.selected);
   // console.log(this.selectedCheckedItems);
    const currentLevel = this.getLevel(node);

    if (currentLevel < 1) {
      return null;
    }

    const startIndex = this.treeControl.dataNodes.indexOf(node) - 1;

    for (let i = startIndex; i >= 0; i--) {
      const currentNode = this.treeControl.dataNodes[i];

      if (this.getLevel(currentNode) < currentLevel) {
        return currentNode;
      }
    }
    return null;
  }
  checkSelected(node: FoodNode) {
    const idx= this.selectedCheckedItems.indexOf(node.item) > -1;
    return idx;
  }
  populateSelectedFruits(): string[] {
    this.selectedFruits = [];
   // if (!this.checklistSelection.selected.length) {
     if(this.selectedCheckedItems.length === 0){
      this.filterChanged('');
    } else {

      // this.checklistSelection.selected.map(s => s.item).forEach(element => {
      //   this.selectedFruits.push(element);
      // });
      this.selectedFruits = [...this.selectedCheckedItems];
      this.focusOnPlaceInput();
    }
    return this.selectedFruits;
  }

  filterChanged(filterText: string) {
   // console.log("filterChanged", filterText);
    
    // ChecklistDatabase.filter method which actually filters the tree and gives back a tree structure
    this._database.filterLodash(filterText);
    // if (filterText) {
    this.treeControl.expandAll();
    //} else {
    // this.treeControl.collapseAll();
    // }
    //console.log(this.checklistSelection);
    console.log('fc' + this.selectedCheckedItems);
  }
  focusOnPlaceInput() {
    //this.autocompleteInput.nativeElement.focus();
    this.autocompleteInput.nativeElement.value = '';
  }
}



