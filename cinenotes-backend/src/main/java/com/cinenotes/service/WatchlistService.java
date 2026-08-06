package com.cinenotes.service;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.cinenotes.domain.Title;
import com.cinenotes.domain.WatchlistItem;
import com.cinenotes.dto.WatchlistItemResponse;
import com.cinenotes.dto.WatchlistUpsertRequest;
import com.cinenotes.exception.ResourceNotFoundException;
import com.cinenotes.mapper.WatchlistItemMapper;
import com.cinenotes.repository.TitleRepository;
import com.cinenotes.repository.WatchlistItemRepository;
import com.cinenotes.user.AppUser;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class WatchlistService {

    private final WatchlistItemRepository watchlistItemRepository;
    private final TitleRepository titleRepository;
    private final CurrentUserService currentUserService;
    private final WatchlistItemMapper watchlistItemMapper;

    @Transactional
    public WatchlistItemResponse upsert(WatchlistUpsertRequest request) {
        AppUser currentUser = currentUserService.getCurrentUser();
        Title title = getTitle(request.titleId());

        WatchlistItem item = watchlistItemRepository
                .findByUserIdAndTitleId(currentUser.getId(), title.getId())
                .orElseGet(() -> {
                    WatchlistItem newItem = watchlistItemMapper.toEntity(request);
                    newItem.setUser(currentUser);
                    newItem.setTitle(title);
                    return newItem;
                });

        watchlistItemMapper.updateEntity(item, request);
        return watchlistItemMapper.toResponse(watchlistItemRepository.save(item));
    }

    @Transactional
    public void removeByTitleId(Long titleId) {
        AppUser currentUser = currentUserService.getCurrentUser();
        getTitle(titleId);

        WatchlistItem item = watchlistItemRepository
                .findByUserIdAndTitleId(currentUser.getId(), titleId)
                .orElseThrow(() -> new ResourceNotFoundException("Watchlist item not found"));

        watchlistItemRepository.delete(item);
    }

    @Transactional(readOnly = true)
    public List<WatchlistItemResponse> findCurrentUserWatchlist() {
        AppUser currentUser = currentUserService.getCurrentUser();

        return watchlistItemRepository.findByUserId(currentUser.getId())
                .stream()
                .map(watchlistItemMapper::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public WatchlistItemResponse findCurrentUserWatchlistItemByTitle(Long titleId) {
        AppUser currentUser = currentUserService.getCurrentUser();
        getTitle(titleId);

        WatchlistItem item = watchlistItemRepository
                .findByUserIdAndTitleId(currentUser.getId(), titleId)
                .orElseThrow(() -> new ResourceNotFoundException("Watchlist item not found"));

        return watchlistItemMapper.toResponse(item);
    }

    private Title getTitle(Long id) {
        return titleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Title not found"));
    }
}
