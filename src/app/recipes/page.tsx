"use client";
import axios from "axios";
import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { AppShell, Box, Container, MultiSelect } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { useRouter } from "next/navigation";
import Image from "next/image";

const BACK_URL = process.env.NEXT_PUBLIC_BACK_URL;

type Recipe = {
  idMeal: string;
  strMeal: string;
  strCategory: string;
  strArea: string;
  strMealThumb: string;
};

const RecipesPage = () => {
  const [allRecipes, setAllRecipes] = useState<Recipe[]>([]);
  const [ingredients, setIngredients] = useState<string[]>([]);
  const [countries, setCountries] = useState<string[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedIngredients, setSelectedIngredients] = useState<string[]>([]);
  const [selectedCountries, setSelectedCountries] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [opened, { toggle }] = useDisclosure();
  const searchParams = useSearchParams();
  const router = useRouter();

  const demoProps = {
    bg: "",
    h: 50,
    mt: "md",
  };

  useEffect(() => {
    const ingredientParams = searchParams.getAll("ingredient");
    const countryParams = searchParams.getAll("country");
    const categoryParams = searchParams.getAll("category");

    const hasFilters =
      ingredientParams.length > 0 ||
      countryParams.length > 0 ||
      categoryParams.length > 0;

    if (hasFilters) {
      setSelectedIngredients(ingredientParams);
      setSelectedCountries(countryParams);
      setSelectedCategories(categoryParams);
      fetchFilteredRecipes(ingredientParams, countryParams, categoryParams);
    } else {
      fetchAllRecipes();
    }
  }, [searchParams]);

  const fetchListOfRecipes = async () => {
    try {
      const [ingredientRes, countryRes, categoryRes] = await Promise.all([
        axios.get(`${BACK_URL}/getListOfRecipes?type=ingredient`),
        axios.get(`${BACK_URL}/getListOfRecipes?type=country`),
        axios.get(`${BACK_URL}/getListOfRecipes?type=category`),
      ]);

      setIngredients(
        ingredientRes.data.meals.map(
          (item: { strIngredient: string }) => item.strIngredient
        )
      );
      setCountries(
        countryRes.data.meals.map((item: { strArea: string }) => item.strArea)
      );
      setCategories(
        categoryRes.data.meals.map(
          (item: { strCategory: string }) => item.strCategory
        )
      );
    } catch (error) {
      console.error("err with fetch list", error);
    }
  };
  const fetchAllRecipes = async () => {
    try {
      const response = await axios.get(`${BACK_URL}/getAllRecipes`);
      setAllRecipes(response.data.meals);
    } catch (error) {
      console.log("failed fetch recipes" + error);
    }
  };

  const fetchFilteredRecipes = async (
    ingredients: string[],
    countries: string[],
    categories: string[]
  ) => {
    if (
      ingredients.length === 0 &&
      countries.length === 0 &&
      categories.length === 0
    ) {
      return;
    }

    try {
      setAllRecipes([]);

      const params = new URLSearchParams();

      ingredients.forEach((i) => params.append("ingredient", i));
      countries.forEach((c) => params.append("country", c));
      categories.forEach((cat) => params.append("category", cat));

      const response = await axios.get(
        `${BACK_URL}/getFilteredRecipes?${params.toString()}`
      );
      setAllRecipes(response.data.meals || []);
    } catch (error) {
      console.error("Error fetching filtered recipes:", error);
    }
  };

  const getTitle = () => {
    const parts = [];

    if (selectedIngredients.length > 0) {
      parts.push(`Ingredient: ${selectedIngredients.join(", ")}`);
    }
    if (selectedCountries.length > 0) {
      parts.push(`Country: ${selectedCountries.join(", ")}`);
    }
    if (selectedCategories.length > 0) {
      parts.push(`Category: ${selectedCategories.join(", ")}`);
    }

    return parts.length > 0 ? parts.join(" | ") : "All Recipes";
  };

  useEffect(() => {
    fetchListOfRecipes();
  }, []);
  return (
    <div>
      <AppShell
        header={{ height: 60 }}
        navbar={{
          width: 300,
          breakpoint: "sm",
          collapsed: { mobile: !opened },
        }}
        padding="md"
      >
        <AppShell.Header>
          <Box
            component="button"
            onClick={toggle}
            style={{ background: "none", border: "none" }}
          >
            <span style={{ fontSize: 24 }}>{opened ? "☰" : "≡"}</span>
          </Box>
        </AppShell.Header>

        <AppShell.Main>
          <h1>{getTitle()}</h1>
          <Container {...demoProps}>
            {allRecipes.map((recipe) => (
              <Box
                key={recipe.idMeal}
                mb="sm"
                p="sm"
                style={{
                  border: "1px solid #ccc",
                  borderRadius: "8px",
                  cursor: "pointer",
                  transition: "background 0.2s",
                }}
                onClick={() => router.push(`/recipe?id=${recipe.idMeal}`)}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.background = "#f0f0f0")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.background = "white")
                }
              >
                <h3>{recipe.strMeal}</h3>
                <p>
                  <strong>Category:</strong> {recipe.strCategory}
                </p>
                <p>
                  <strong>Area:</strong> {recipe.strArea}
                </p>
                <Image
                  src={recipe.strMealThumb}
                  alt={recipe.strMeal}
                  width={150}
                  height={150}
                />
              </Box>
            ))}
          </Container>
        </AppShell.Main>
        <AppShell.Navbar p="lg">
          <MultiSelect
            label="Ingredient"
            placeholder="Pick Ingredient"
            data={ingredients}
            value={selectedIngredients}
            onChange={(val) => {
              setSelectedIngredients(val);
              fetchFilteredRecipes(val, selectedCountries, selectedCategories);
            }}
          />

          <MultiSelect
            label="Country"
            placeholder="Pick Country"
            data={countries}
            value={selectedCountries}
            onChange={(val) => {
              setSelectedCountries(val);
              fetchFilteredRecipes(
                selectedIngredients,
                val,
                selectedCategories
              );
            }}
          />

          <MultiSelect
            label="Category"
            placeholder="Pick Category"
            data={categories}
            value={selectedCategories}
            onChange={(val) => {
              setSelectedCategories(val);
              fetchFilteredRecipes(selectedIngredients, selectedCountries, val);
            }}
          />
        </AppShell.Navbar>
      </AppShell>
    </div>
  );
};

export default function RecipesPageWithSuspense() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <RecipesPage />
    </Suspense>
  );
}
