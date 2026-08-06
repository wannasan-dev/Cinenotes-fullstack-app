package com.cinenotes.service;

import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.cinenotes.domain.Genre;
import com.cinenotes.domain.MoodTag;
import com.cinenotes.domain.Title;
import com.cinenotes.domain.TitleGenre;
import com.cinenotes.domain.TitleMoodTag;
import com.cinenotes.domain.TitleType;
import com.cinenotes.dto.TitleRequest;
import com.cinenotes.dto.TitleResponse;
import com.cinenotes.exception.DuplicateResourceException;
import com.cinenotes.exception.InvalidOperationException;
import com.cinenotes.exception.ResourceNotFoundException;
import com.cinenotes.mapper.TitleMapper;
import com.cinenotes.repository.GenreRepository;
import com.cinenotes.repository.MoodTagRepository;
import com.cinenotes.repository.TitleGenreRepository;
import com.cinenotes.repository.TitleMoodTagRepository;
import com.cinenotes.repository.TitleRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class TitleService {

    private final TitleRepository titleRepository;
    private final GenreRepository genreRepository;
    private final MoodTagRepository moodTagRepository;
    private final TitleGenreRepository titleGenreRepository;
    private final TitleMoodTagRepository titleMoodTagRepository;
    private final TitleMapper titleMapper;

    @Transactional(readOnly = true)
    public List<TitleResponse> findAll() {
        return titleRepository.findAll()
                .stream()
                .map(titleMapper::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<TitleResponse> findAll(TitleType type, String genre, String keyword) {
        return findAll(type, genre, null, keyword);
    }

    @Transactional(readOnly = true)
    public List<TitleResponse> findAll(TitleType type, String genre, String moodTag, String keyword) {
        return titleRepository.findAllWithFilters(
                        type,
                        normalize(genre),
                        normalize(moodTag),
                        normalize(keyword)
                )
                .stream()
                .map(titleMapper::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public TitleResponse findById(Long id) {
        return titleMapper.toResponse(getTitle(id));
    }

    @Transactional(readOnly = true)
    public List<TitleResponse> searchByName(String keyword) {
        return titleRepository.findByNameContainingIgnoreCase(normalize(keyword))
                .stream()
                .map(titleMapper::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<TitleResponse> findByType(TitleType type) {
        return titleRepository.findByType(type)
                .stream()
                .map(titleMapper::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<TitleResponse> findByGenre(String genreName) {
        return titleRepository.findDistinctByTitleGenres_Genre_NameIgnoreCase(genreName)
                .stream()
                .map(titleMapper::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<TitleResponse> findByMoodTag(String moodTagName) {
        return titleRepository.findDistinctByTitleMoodTags_MoodTag_NameIgnoreCase(moodTagName)
                .stream()
                .map(titleMapper::toResponse)
                .toList();
    }

    @Transactional
    public TitleResponse create(TitleRequest request) {
        ensureUniqueTmdbIdAndType(request, null);

        Title title = titleMapper.toEntity(request);
        Title savedTitle = titleRepository.save(title);

        replaceGenres(savedTitle, request.getGenreIds());
        replaceMoodTags(savedTitle, request.getMoodTagIds());

        return titleMapper.toResponse(savedTitle);
    }

    @Transactional
    public TitleResponse update(Long id, TitleRequest request) {
        Title title = getTitle(id);
        ensureUniqueTmdbIdAndType(request, id);

        titleMapper.updateEntity(title, request);
        Title savedTitle = titleRepository.save(title);

        replaceGenres(savedTitle, request.getGenreIds());
        replaceMoodTags(savedTitle, request.getMoodTagIds());

        return titleMapper.toResponse(savedTitle);
    }

    @Transactional
    public void delete(Long id) {
        Title title = getTitle(id);

        titleGenreRepository.deleteByTitleId(id);
        titleMoodTagRepository.deleteByTitleId(id);
        titleRepository.delete(title);
    }

    private Title getTitle(Long id) {
        return titleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Title not found"));
    }

    private void ensureUniqueTmdbIdAndType(TitleRequest request, Long currentTitleId) {
        if (request.getTmdbId() == null || request.getType() == null) {
            return;
        }

        titleRepository.findByTmdbIdAndType(request.getTmdbId(), request.getType())
                .filter(existingTitle -> !existingTitle.getId().equals(currentTitleId))
                .ifPresent(existingTitle -> {
                    throw new DuplicateResourceException("Title with this TMDb id and type already exists");
                });
    }

    private void replaceGenres(Title title, List<Long> genreIds) {
        titleGenreRepository.deleteByTitleId(title.getId());
        title.getTitleGenres().clear();

        for (Genre genre : findGenresByIds(genreIds)) {
            TitleGenre titleGenre = new TitleGenre();
            titleGenre.setTitle(title);
            titleGenre.setGenre(genre);
            title.getTitleGenres().add(titleGenreRepository.save(titleGenre));
        }
    }

    private void replaceMoodTags(Title title, List<Long> moodTagIds) {
        titleMoodTagRepository.deleteByTitleId(title.getId());
        title.getTitleMoodTags().clear();

        for (MoodTag moodTag : findMoodTagsByIds(moodTagIds)) {
            TitleMoodTag titleMoodTag = new TitleMoodTag();
            titleMoodTag.setTitle(title);
            titleMoodTag.setMoodTag(moodTag);
            title.getTitleMoodTags().add(titleMoodTagRepository.save(titleMoodTag));
        }
    }

    private List<Genre> findGenresByIds(List<Long> genreIds) {
        Set<Long> uniqueIds = normalizeIds(genreIds);
        if (uniqueIds.isEmpty()) {
            return List.of();
        }

        List<Genre> genres = genreRepository.findAllById(uniqueIds);
        if (genres.size() != uniqueIds.size()) {
            throw new ResourceNotFoundException("One or more genres were not found");
        }

        return genres;
    }

    private List<MoodTag> findMoodTagsByIds(List<Long> moodTagIds) {
        Set<Long> uniqueIds = normalizeIds(moodTagIds);
        if (uniqueIds.isEmpty()) {
            return List.of();
        }

        List<MoodTag> moodTags = moodTagRepository.findAllById(uniqueIds);
        if (moodTags.size() != uniqueIds.size()) {
            throw new ResourceNotFoundException("One or more mood tags were not found");
        }

        return moodTags;
    }

    private Set<Long> normalizeIds(List<Long> ids) {
        if (ids == null || ids.isEmpty()) {
            return Set.of();
        }

        Set<Long> uniqueIds = new LinkedHashSet<>();
        for (Long id : ids) {
            if (id == null) {
                throw new InvalidOperationException("Referenced ids must not be null");
            }
            uniqueIds.add(id);
        }

        return uniqueIds;
    }

    private String normalize(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }

        return value.trim();
    }
}
