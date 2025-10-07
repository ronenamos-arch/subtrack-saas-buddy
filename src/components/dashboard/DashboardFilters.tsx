import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCategories } from "@/hooks/useCategories";

interface DashboardFiltersProps {
  selectedCategory: string;
  onCategoryChange: (value: string) => void;
  selectedYear: string;
  onYearChange: (value: string) => void;
}

export const DashboardFilters = ({
  selectedCategory,
  onCategoryChange,
  selectedYear,
  onYearChange,
}: DashboardFiltersProps) => {
  const { categories } = useCategories();

  // Generate last 3 years
  const currentYear = new Date().getFullYear();
  const years = [
    currentYear.toString(),
    (currentYear - 1).toString(),
    (currentYear - 2).toString(),
  ];

  return (
    <div className="flex flex-col sm:flex-row gap-4 p-4 bg-card/50 rounded-lg border">
      <div className="flex-1 space-y-2">
        <Label>קטגוריה</Label>
        <Select value={selectedCategory} onValueChange={onCategoryChange}>
          <SelectTrigger>
            <SelectValue placeholder="כל הקטגוריות" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">כל הקטגוריות</SelectItem>
            {categories.map((category) => (
              <SelectItem key={category.id} value={category.id}>
                <div className="flex items-center gap-2">
                  <div
                    className="h-3 w-3 rounded-full"
                    style={{ backgroundColor: category.color }}
                  />
                  {category.name}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex-1 space-y-2">
        <Label>שנה</Label>
        <Select value={selectedYear} onValueChange={onYearChange}>
          <SelectTrigger>
            <SelectValue placeholder="בחר שנה" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">כל השנים</SelectItem>
            {years.map((year) => (
              <SelectItem key={year} value={year}>
                {year}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};
