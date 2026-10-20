
package com.fidelis.public_service_request;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
public class HealthController {

    @GetMapping("/api/health")
    public Map<String, String> healthCheck() {
        return Map.of(
                "status", "UP",
                "message", "Public Service Request API is running"
        );
    }
}
