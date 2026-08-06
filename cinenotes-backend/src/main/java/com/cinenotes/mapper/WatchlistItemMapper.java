package com.cinenotes.mapper;

import org.springframework.stereotype.Component;

import com.cinenotes.domain.WatchlistItem;
import com.cinenotes.dto.WatchlistItemResponse;
import com.cinenotes.dto.WatchlistUpsertRequest;

import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class WatchlistItemMapper {

    private final TitleMapper titleMapper;

    public WatchlistItem toEntity(WatchlistUpsertRequest request) {
        if (request == null) {
            return null;
        }

        WatchlistItem item = new WatchlistItem();
        item.setStatus(request.status());
        item.setIsFavorite(Boolean.TRUE.equals(request.favorite()));
        return item;
    }

    public WatchlistItemResponse toResponse(WatchlistItem item) {
        if (item == null) {
            return null;
        }

        return new WatchlistItemResponse(
                item.getId(),
                titleMapper.toSummaryResponse(item.getTitle()),
                item.getStatus(),
                item.getIsFavorite(),
                item.getCreatedAt(),
                item.getUpdatedAt()
        );
    }

    public void updateEntity(WatchlistItem item, WatchlistUpsertRequest request) {
        if (item == null || request == null) {
            return;
        }

        if (request.status() != null) {
            item.setStatus(request.status());
        }

        if (request.favorite() != null) {
            item.setIsFavorite(request.favorite());
        }
    }
}
