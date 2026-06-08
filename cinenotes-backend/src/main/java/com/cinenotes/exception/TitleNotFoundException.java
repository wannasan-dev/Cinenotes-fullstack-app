package com.cinenotes.exception;

public class TitleNotFoundException extends RuntimeException {

    private static final long serialVersionUID = 1L;

	public TitleNotFoundException(Long id) {
        super("Title not found with id: " + id);
    }
}