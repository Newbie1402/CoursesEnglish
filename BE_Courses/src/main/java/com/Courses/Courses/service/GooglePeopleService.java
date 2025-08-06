package com.Courses.Courses.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

@Service
public class GooglePeopleService {
    @Autowired private RestTemplate restTemplate;
    @Autowired private ObjectMapper objectMapper;

    public String fetchPrimaryPhone(String accessToken) throws Exception {
        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(accessToken);
        HttpEntity<Void> entity = new HttpEntity<>(headers);

        ResponseEntity<String> response = restTemplate.exchange(
                "https://people.googleapis.com/v1/people/me?personFields=phoneNumbers",
                HttpMethod.GET,
                entity,
                String.class
        );
        JsonNode json = objectMapper.readTree(response.getBody());
        JsonNode phones = json.path("phoneNumbers");
        if (phones.isArray() && phones.size() > 0) {
            return phones.get(0).path("value").asText();
        }
        return null;
    }
}
