
import React, { useState } from 'react';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Edit, Trash2, Plus } from "lucide-react";

interface TagsManagerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  entityType: 'contacts' | 'companies' | 'deals';
}

interface Tag {
  id: number;
  name: string;
  color: string;
  count?: number;
}

export function TagsManager({ 
  open, 
  onOpenChange,
  entityType 
}: TagsManagerProps) {
  const [tags, setTags] = useState<Tag[]>([
    { id: 1, name: 'Customer', color: 'green', count: 24 },
    { id: 2, name: 'Prospect', color: 'blue', count: 18 },
    { id: 3, name: 'Lead', color: 'yellow', count: 12 },
    { id: 4, name: 'Partner', color: 'purple', count: 8 },
    { id: 5, name: 'Cold', color: 'gray', count: 5 },
  ]);
  const [isAddingTag, setIsAddingTag] = useState(false);
  const [editingTag, setEditingTag] = useState<Tag | null>(null);
  const [newTagName, setNewTagName] = useState('');
  const [newTagColor, setNewTagColor] = useState('blue');
  const { toast } = useToast();
  
  const handleAddTag = () => {
    if (!newTagName.trim()) {
      toast({
        title: "Name required",
        description: "Please enter a name for the tag.",
        variant: "destructive"
      });
      return;
    }
    
    const newTag: Tag = {
      id: Math.max(0, ...tags.map(t => t.id)) + 1,
      name: newTagName,
      color: newTagColor,
      count: 0
    };
    
    setTags([...tags, newTag]);
    setNewTagName('');
    setNewTagColor('blue');
    setIsAddingTag(false);
    
    toast({
      title: "Tag created",
      description: `The tag "${newTagName}" has been created.`
    });
  };
  
  const handleUpdateTag = () => {
    if (!editingTag) return;
    
    if (!newTagName.trim()) {
      toast({
        title: "Name required",
        description: "Please enter a name for the tag.",
        variant: "destructive"
      });
      return;
    }
    
    const updatedTags = tags.map(tag => 
      tag.id === editingTag.id 
        ? { ...tag, name: newTagName, color: newTagColor } 
        : tag
    );
    
    setTags(updatedTags);
    setEditingTag(null);
    setNewTagName('');
    setNewTagColor('blue');
    
    toast({
      title: "Tag updated",
      description: `The tag has been updated to "${newTagName}".`
    });
  };
  
  const handleDeleteTag = (tagId: number) => {
    const tagToDelete = tags.find(t => t.id === tagId);
    if (!tagToDelete) return;
    
    const updatedTags = tags.filter(tag => tag.id !== tagId);
    setTags(updatedTags);
    
    toast({
      title: "Tag deleted",
      description: `The tag "${tagToDelete.name}" has been deleted.`
    });
  };
  
  const startEditing = (tag: Tag) => {
    setEditingTag(tag);
    setNewTagName(tag.name);
    setNewTagColor(tag.color);
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Manage {entityType.charAt(0).toUpperCase() + entityType.slice(1)} Tags</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          {(isAddingTag || editingTag) ? (
            <div className="space-y-4 p-4 border rounded-md">
              <h3 className="text-sm font-medium">
                {editingTag ? "Edit Tag" : "Create New Tag"}
              </h3>
              
              <div className="space-y-2">
                <Label htmlFor="tagName">Tag Name</Label>
                <Input 
                  id="tagName" 
                  placeholder="Enter tag name" 
                  value={newTagName}
                  onChange={(e) => setNewTagName(e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="tagColor">Tag Color</Label>
                <Select value={newTagColor} onValueChange={setNewTagColor}>
                  <SelectTrigger id="tagColor">
                    <SelectValue placeholder="Select a color" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="blue">Blue</SelectItem>
                    <SelectItem value="green">Green</SelectItem>
                    <SelectItem value="red">Red</SelectItem>
                    <SelectItem value="yellow">Yellow</SelectItem>
                    <SelectItem value="purple">Purple</SelectItem>
                    <SelectItem value="gray">Gray</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex justify-end gap-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => {
                    setIsAddingTag(false);
                    setEditingTag(null);
                  }}
                >
                  Cancel
                </Button>
                <Button 
                  type="button" 
                  onClick={editingTag ? handleUpdateTag : handleAddTag}
                >
                  {editingTag ? "Update Tag" : "Add Tag"}
                </Button>
              </div>
            </div>
          ) : (
            <Button onClick={() => setIsAddingTag(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add New Tag
            </Button>
          )}
          
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tag</TableHead>
                <TableHead>Color</TableHead>
                <TableHead>Used</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tags.map((tag) => (
                <TableRow key={tag.id}>
                  <TableCell>
                    <Badge 
                      variant="outline" 
                      className={`bg-${tag.color}-100 text-${tag.color}-800 border-${tag.color}-200`}
                    >
                      {tag.name}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className={`w-6 h-6 rounded-full bg-${tag.color}-500`} />
                  </TableCell>
                  <TableCell>{tag.count || 0} times</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8" 
                        onClick={() => startEditing(tag)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 text-destructive hover:text-destructive" 
                        onClick={() => handleDeleteTag(tag.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        
        <DialogFooter>
          <Button type="button" onClick={() => onOpenChange(false)}>
            Done
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
