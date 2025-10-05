import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search } from "lucide-react";
import { useCategories } from "@/hooks/useCategories";

interface SubscriptionFiltersProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  statusFilter: string;
  onStatusChange: (value: string) => void;
  categoryFilter: string;
  onCategoryChange: (value: string) => void;
  sortBy: string;
  onSortChange: (value: string) => void;
}

export const SubscriptionFilters = ({
  searchQuery,
  onSearchChange,
  statusFilter,
  onStatusChange,
  categoryFilter,
  onCategoryChange,
  sortBy,
  onSortChange,
}: SubscriptionFiltersProps) => {
  const { categories } = useCategories();

  return (
    <div className="flex flex-col md:flex-row gap-4">
      <div className="relative flex-1">
        <Search className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="חפש מנוי..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pr-9"
        />
      </div>

      <Select value={statusFilter} onValueChange={onStatusChange}>
        <SelectTrigger className="w-full md:w-[180px]">
          <SelectValue placeholder="כל הסטטוסים" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">כל הסטטוסים</SelectItem>
          <SelectItem value="active">פעיל</SelectItem>
          <SelectItem value="paused">מושהה</SelectItem>
          <SelectItem value="cancelled">בוטל</SelectItem>
        </SelectContent>
      </Select>

      <Select value={categoryFilter} onValueChange={onCategoryChange}>
        <SelectTrigger className="w-full md:w-[180px]">
          <SelectValue placeholder="כל הקטגוריות" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">כל הקטגוריות</SelectItem>
          {categories.map((cat) => (
            <SelectItem key={cat.id} value={cat.id}>
              {cat.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={sortBy} onValueChange={onSortChange}>
        <SelectTrigger className="w-full md:w-[180px]">
          <SelectValue placeholder="מיין לפי" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="renewal-asc">חידוש - מוקדם לאחרון</SelectItem>
          <SelectItem value="renewal-desc">חידוש - אחרון למוקדם</SelectItem>
          <SelectItem value="cost-asc">עלות - נמוכה לגבוהה</SelectItem>
          <SelectItem value="cost-desc">עלות - גבוהה לנמוכה</SelectItem>
          <SelectItem value="name-asc">שם - א-ת</SelectItem>
          <SelectItem value="name-desc">שם - ת-א</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};
