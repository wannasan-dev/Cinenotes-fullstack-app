package com.cinenotes.service;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.cinenotes.domain.AuditAction;
import com.cinenotes.domain.Genre;
import com.cinenotes.dto.GenreRequest;
import com.cinenotes.dto.GenreResponse;
import com.cinenotes.exception.DuplicateResourceException;
import com.cinenotes.exception.InvalidOperationException;
import com.cinenotes.exception.ResourceNotFoundException;
import com.cinenotes.mapper.GenreMapper;
import com.cinenotes.repository.GenreRepository;
import com.cinenotes.repository.TitleGenreRepository;
import com.cinenotes.user.AppUser;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class GenreService {

    private static final String TARGET_GENRE = "GENRE";

    private final GenreRepository genreRepository;
    private final TitleGenreRepository titleGenreRepository;
    private final GenreMapper genreMapper;
    private final AdminAuthorizationService adminAuthorizationService;
    private final AuditLogService auditLogService;

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
        AppUser actor = adminAuthorizationService.requireAdmin();
        ensureUniqueName(request.name(), null);

        Genre genre = genreMapper.toEntity(request);
        Genre savedGenre = genreRepository.save(genre);
        auditLogService.log(
                actor,
                AuditAction.GENRE_CREATED,
                TARGET_GENRE,
                savedGenre.getId(),
                "Created genre " + savedGenre.getName()
        );

        return genreMapper.toResponse(savedGenre);
    }

    @Transactional
    public GenreResponse update(Long id, GenreRequest request) {
        AppUser actor = adminAuthorizationService.requireAdmin();
        Genre genre = getGenre(id);
        ensureUniqueName(request.name(), id);

        genreMapper.updateEntity(genre, request);
        Genre savedGenre = genreRepository.save(genre);
        auditLogService.log(
                actor,
                AuditAction.GENRE_UPDATED,
                TARGET_GENRE,
                savedGenre.getId(),
                "Updated genre " + savedGenre.getName()
        );

        return genreMapper.toResponse(savedGenre);
    }

    @Transactional
    public void delete(Long id) {
        AppUser actor = adminAuthorizationService.requireAdmin();
        Genre genre = getGenre(id);

        if (titleGenreRepository.existsByGenreId(id)) {
            throw new InvalidOperationException("Genre is assigned to one or more titles");
        }

        genreRepository.delete(genre);
        auditLogService.log(
                actor,
                AuditAction.GENRE_DELETED,
                TARGET_GENRE,
                id,
                "Deleted genre " + genre.getName()
        );
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
