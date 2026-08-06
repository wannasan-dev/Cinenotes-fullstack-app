package com.cinenotes.service;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.cinenotes.domain.Genre;
import com.cinenotes.dto.GenreRequest;
import com.cinenotes.dto.GenreResponse;
import com.cinenotes.exception.DuplicateResourceException;
import com.cinenotes.exception.InvalidOperationException;
import com.cinenotes.exception.ResourceNotFoundException;
import com.cinenotes.mapper.GenreMapper;
import com.cinenotes.repository.GenreRepository;
import com.cinenotes.repository.TitleGenreRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class GenreService {

    private final GenreRepository genreRepository;
    private final TitleGenreRepository titleGenreRepository;
    private final GenreMapper genreMapper;

    @Transactional(readOnly = true)
    public List<GenreResponse> findAll() {
        return genreRepository.findAll()
                .stream()
                .map(genreMapper::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public GenreResponse findById(Long id) {
        return genreMapper.toResponse(getGenre(id));
    }

    @Transactional
    public GenreResponse create(GenreRequest request) {
        ensureUniqueName(request.name(), null);

        Genre genre = genreMapper.toEntity(request);
        return genreMapper.toResponse(genreRepository.save(genre));
    }

    @Transactional
    public GenreResponse update(Long id, GenreRequest request) {
        Genre genre = getGenre(id);
        ensureUniqueName(request.name(), id);

        genreMapper.updateEntity(genre, request);
        return genreMapper.toResponse(genreRepository.save(genre));
    }

    @Transactional
    public void delete(Long id) {
        Genre genre = getGenre(id);

        if (titleGenreRepository.existsByGenreId(id)) {
            throw new InvalidOperationException("Genre is assigned to one or more titles");
        }

        genreRepository.delete(genre);
    }

    private Genre getGenre(Long id) {
        return genreRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Genre not found"));
    }

    private void ensureUniqueName(String name, Long currentGenreId) {
        genreRepository.findByNameIgnoreCase(name)
                .filter(existingGenre -> !existingGenre.getId().equals(currentGenreId))
                .ifPresent(existingGenre -> {
                    throw new DuplicateResourceException("Genre name already exists");
                });
    }
}
