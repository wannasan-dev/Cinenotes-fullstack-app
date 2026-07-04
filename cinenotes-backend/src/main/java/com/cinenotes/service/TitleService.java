package com.cinenotes.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.cinenotes.domain.Title;
import com.cinenotes.domain.TitleType;
import com.cinenotes.dto.TitleRequest;
import com.cinenotes.dto.TitleResponse;
import com.cinenotes.exception.TitleNotFoundException;
import com.cinenotes.mapper.TitleMapper;
import com.cinenotes.repository.TitleRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class TitleService {

    private final TitleRepository titleRepository;
    private final TitleMapper titleMapper;

    public List<TitleResponse> findAll() {
        return titleRepository.findAll()
                .stream()
                .map(titleMapper::toResponse)
                .toList();
    }

    public TitleResponse findById(Long id) {
        Title title = titleRepository.findById(id)
                .orElseThrow(() -> new TitleNotFoundException(id));

        return titleMapper.toResponse(title);
    }

    public TitleResponse create(TitleRequest request) {
        Title title = titleMapper.toEntity(request);
        Title savedTitle = titleRepository.save(title);

        return titleMapper.toResponse(savedTitle);
    }

    public TitleResponse update(Long id, TitleRequest request) {
        Title title = titleRepository.findById(id)
                .orElseThrow(() -> new TitleNotFoundException(id));

        titleMapper.updateEntity(title, request);

        Title updatedTitle = titleRepository.save(title);

        return titleMapper.toResponse(updatedTitle);
    }

    public void delete(Long id) {
        if (!titleRepository.existsById(id)) {
            throw new TitleNotFoundException(id);
        }

        titleRepository.deleteById(id);
    }
    
    public List<TitleResponse> findAll(TitleType type, String genre, String keyword) {
        return titleRepository.findAllWithFilters(type, genre, keyword)
                .stream()
                .map(titleMapper::toResponse)
                .toList();
    }
    
    
}
