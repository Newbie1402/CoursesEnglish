package com.Courses.Courses.model.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.*;

import java.io.Serializable;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class ResponseData<T> implements Serializable {
    private int StatusCode;
    private String Message;
    @JsonInclude(JsonInclude.Include.NON_NULL)
    private T data;
}
