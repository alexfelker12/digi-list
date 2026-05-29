import { SearchField } from "heroui-native";
import { cn } from "tailwind-variants";


type SearchItemFieldProps = {
  search: string
  setSearch: React.Dispatch<React.SetStateAction<string>>
} & React.ComponentProps<typeof SearchField>
export function SearchItemField({ search, setSearch, className, ...props }: SearchItemFieldProps) {
  return (
    <SearchField
      value={search}
      onChange={setSearch}
      className={cn("overflow-visible", className)}
      {...props}
    >
      <SearchField.Group>
        <SearchField.SearchIcon />
        <SearchField.Input placeholder="Produkt suchen..." variant="primary" />
        <SearchField.ClearButton />
      </SearchField.Group>
    </SearchField>
  );
}
