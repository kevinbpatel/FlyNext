"use client";

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";

interface HotelFiltersProps {
  nameFilter: string;
  setNameFilter: (value: string) => void;
  sortBy: string;
  setSortBy: (value: string) => void;
  priceRange: string;
  setPriceRange: (value: string) => void;
  starRating: string;
  setStarRating: (value: string) => void;
}

export default function HotelFilters({
  nameFilter,
  setNameFilter,
  sortBy,
  setSortBy,
  priceRange,
  setPriceRange,
  starRating,
  setStarRating,
}: HotelFiltersProps) {
  return (
    <div className="flex space-x-4">
      {/* Name Filter */}
      <div style={{ width: "25%" }}>
        <div className="h-10 w-full border border-input rounded-md px-3 bg-background flex items-center">
          <input
            type="text"
            placeholder="Filter by hotel name"
            className="w-full h-full border-none outline-none bg-transparent text-sm"
            value={nameFilter}
            onChange={(e) => setNameFilter(e.target.value)}
          />
        </div>
      </div>
      
      {/* Sort By */}
      <div style={{ width: "25%" }}>
        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger style={{ height: "40px" }}>
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>Sort by</SelectLabel>
              <SelectItem value="price-low">Price (low to high)</SelectItem>
              <SelectItem value="price-high">Price (high to low)</SelectItem>
              <SelectItem value="rating">Star rating</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>
      
      {/* Price Range */}
      <div style={{ width: "25%" }}>
        <Select value={priceRange} onValueChange={setPriceRange}>
          <SelectTrigger style={{ height: "40px" }}>
            <SelectValue placeholder="Price range" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>Price range</SelectLabel>
              <SelectItem value="any">Any price</SelectItem>
              <SelectItem value="0-100">$0 - $100</SelectItem>
              <SelectItem value="100-200">$100 - $200</SelectItem>
              <SelectItem value="200+">$200+</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>
      
      {/* Star Rating */}
      <div style={{ width: "25%" }}>
        <Select value={starRating} onValueChange={setStarRating}>
          <SelectTrigger style={{ height: "40px" }}>
            <SelectValue placeholder="Star rating" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>Star rating</SelectLabel>
              <SelectItem value="any">Any stars</SelectItem>
              <SelectItem value="5">5 Star</SelectItem>
              <SelectItem value="4">4 Star</SelectItem>
              <SelectItem value="3">3 Star</SelectItem>
              <SelectItem value="2">2 Star</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}