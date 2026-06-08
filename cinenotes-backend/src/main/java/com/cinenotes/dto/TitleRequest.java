package com.cinenotes.dto;

import com.cinenotes.domain.Genre;
import com.cinenotes.domain.TitleType;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class TitleRequest {

	@NotNull(message = "type is required")
	private TitleType type;
	
	@NotBlank(message = "name is required")
    private String name;
	
	@NotNull(message = "genre is required")
	private Genre genre;

	@NotNull(message = "rating is required")
    @DecimalMin(value = "0.0", message = "rating must be at least 0")
    @DecimalMax(value = "10.0", message = "rating must be at most 10")
    private Double rating;
	
	@NotBlank(message = "description is required")
	@Size(max = 200, message = "description must be <= 200 characters")
	private String description;

	@NotNull(message = "releaseYear is required")
	@Min(value = 1888, message = "releaseYear must be realistic")
	@Max(value = 2100, message = "releaseYear must be realistic")
    private Integer releaseYear;
	
	@NotBlank(message = "posterUrl is required")
    private String posterUrl;
	
	@NotBlank(message = "recommendationText is required")
	private String recommendationText;
}
