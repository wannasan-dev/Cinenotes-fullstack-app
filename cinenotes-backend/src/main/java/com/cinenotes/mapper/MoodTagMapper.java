package com.cinenotes.mapper;

import org.springframework.stereotype.Component;

import com.cinenotes.domain.MoodTag;
import com.cinenotes.dto.MoodTagRequest;
import com.cinenotes.dto.MoodTagResponse;

@Component
public class MoodTagMapper {

    public MoodTag toEntity(MoodTagRequest request) {
        if (request == null) {
            return null;
        }

        MoodTag moodTag = new MoodTag();
        updateEntity(moodTag, request);
        return moodTag;
    }

    public MoodTagResponse toResponse(MoodTag moodTag) {
        if (moodTag == null) {
            return null;
        }

        return new MoodTagResponse(
                moodTag.getId(),
                moodTag.getName(),
                moodTag.getDescription()
        );
    }

    public void updateEntity(MoodTag moodTag, MoodTagRequest request) {
        if (moodTag == null || request == null) {
            return;
        }

        moodTag.setName(request.name());
        moodTag.setDescription(request.description());
    }
}
