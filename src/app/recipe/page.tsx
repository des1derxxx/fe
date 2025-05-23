"use client";
import axios from "axios";
import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Box,
  Container,
  Image,
  Text,
  Title,
  Stack,
  Divider,
  Button,
} from "@mantine/core";

const BACK_URL = process.env.NEXT_PUBLIC_BACK_URL;

type Recipe = {
  idMeal: string;
  strMeal: string;
  strCategory: string;
  strArea: string;
  strMealThumb: string;
  strInstructions: string;
  [key: `strIngredient${number}`]: string | undefined;
};

const RecipeInfoPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams.get("id");

  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [categoryRecipes, setCategoryRecipes] = useState<Recipe[]>([]);

  useEffect(() => {
    if (!id) return;

    const fetchRecipe = async () => {
      const res = await axios.get(`${BACK_URL}/getRecipeById?id=${id}`);
      const meal = res.data.meals?.[0];
      setRecipe(meal);

      if (meal?.strCategory) {
        const catRes = await axios.get(
          `${BACK_URL}/getFilteredRecipes?category=${meal.strCategory}`
        );
        setCategoryRecipes(catRes.data.meals || []);
      }
    };

    fetchRecipe();
  }, [id]);

  if (!recipe)
    return (
      <Text ta="center" mt="xl">
        Loading...
      </Text>
    );

  const getIngredients = () => {
    const list = [];
    for (let i = 1; i <= 20; i++) {
      const ing = recipe[`strIngredient${i}`];
      if (ing && ing.trim() !== "") list.push(ing);
    }
    return list;
  };

  return (
    <Container size="lg" mt="xl" style={{ display: "flex", gap: 24 }}>
      <Box style={{ flex: 3 }}>
        <Image
          src={recipe.strMealThumb}
          alt={recipe.strMeal}
          width={300}
          height={300}
          radius="md"
          fit="cover"
          mb="md"
        />
        <Title order={2} mb="sm" ta="center">
          {recipe.strMeal}
        </Title>
        <Text size="sm" color="dimmed" ta="center" mb="md">
          Country:{" "}
          <Button
            variant="subtle"
            size="xs"
            onClick={() => router.push(`/recipes?country=${recipe.strArea}`)}
            style={{ padding: 0, minWidth: 0 }}
          >
            {recipe.strArea}
          </Button>
        </Text>

        <Divider my="md" />

        <Text style={{ whiteSpace: "pre-line" }}>{recipe.strInstructions}</Text>

        <Title order={4} mt="xl" mb="sm">
          Ingredients:
        </Title>
        <Stack gap={4}>
          {getIngredients().map((ing, i) => (
            <Button
              key={i}
              variant="light"
              size="xs"
              onClick={() => router.push(`/recipes?ingredient=${ing}`)}
              style={{ paddingLeft: 4, minWidth: 0 }}
            >
              {ing}
            </Button>
          ))}
        </Stack>
      </Box>
      <Box style={{ flex: 1 }}>
        <Title order={4} mb="md">
          More in {recipe.strCategory}:
        </Title>
        <Stack gap={6}>
          {categoryRecipes.map((r) => (
            <Button
              key={r.idMeal}
              variant="light"
              size="xs"
              onClick={() => router.push(`/recipe?id=${r.idMeal}`)}
              style={{ paddingLeft: 4, minWidth: 0 }}
            >
              {r.strMeal}
            </Button>
          ))}
        </Stack>
      </Box>
    </Container>
  );
};

export default function RecipePageWithSuspense() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <RecipeInfoPage />
    </Suspense>
  );
}
