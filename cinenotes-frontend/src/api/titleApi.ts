import type { Title } from "../types/title";

const API_BASE_URL = "http://localhost:8080/api/titles";

export async function fetchTitles(): Promise<Title[]> {
  const response = await fetch(API_BASE_URL);

  if (!response.ok) {
    throw new Error("Failed to fetch titles");
  }

  return response.json();
}