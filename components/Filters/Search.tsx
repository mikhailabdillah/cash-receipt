import { SearchIcon } from "lucide-react";
import { useCallback } from "react";
import { Field } from "../ui/field";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "../ui/input-group";

interface SearchProps {
  onSearch: (query: string) => void;
  searchTerm: string;
}

const Search = ({ searchTerm, onSearch }: SearchProps) => {
  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onSearch(e.target.value);
    },
    [onSearch]
  );

  return (
    <Field className="max-w-sm">
      <InputGroup>
        <InputGroupInput
          id="search-debts"
          onChange={handleChange}
          placeholder="Search..."
          value={searchTerm}
        />
        <InputGroupAddon align="inline-start">
          <SearchIcon className="text-muted-foreground" />
        </InputGroupAddon>
      </InputGroup>
    </Field>
  );
};

export default Search;
