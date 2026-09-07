package com.cinenotes.repository;

public interface TitleRatingAggregate {

    Long getTitleId();

    Double getAverageRating();

    Long getRatingCount();
}
