import type { Title } from "../types/title";

const API_BASE_URL = "http://localhost:8080/api/titles";

export type TitleRequest = {

  type: "MOVIE" | "SERIES";

  name: string;

  genres: string[];

  rating: number;

  description: string;

  releaseYear: number;

  posterUrl: string;

  reviewText: string;

};


export async function fetchTitles(): Promise<Title[]> {

  const response = await fetch(API_BASE_URL);

  if (!response.ok) {

    throw new Error("Failed to fetch titles");

  }

  return response.json();

}

export async function createTitle(
  request: TitleRequest,
  token: string
): Promise<Title> {

  const response = await fetch(API_BASE_URL, {

    method: "POST",

    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },

    body: JSON.stringify(request),

  });

  if (!response.ok) {

    throw new Error("Failed to create title");

  }

  return response.json();

}

export async function updateTitle(
  id: number,
  request: TitleRequest,
  token: string
): Promise<Title> {
  const response = await fetch(`${API_BASE_URL}/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    throw new Error("Failed to update title");
  }

  return response.json();
}

  export async function deleteTitle(id: number, token: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error("Failed to delete title");
    }
  }
