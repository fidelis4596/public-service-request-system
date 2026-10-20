
package com.fidelis.public_service_request;

import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/requests")
public class ServiceRequestController {

    private final ServiceRequestRepository repository;

    public ServiceRequestController(ServiceRequestRepository repository) {
        this.repository = repository;
    }

    // Submit a new service request
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ServiceRequest createRequest(
            @Valid @RequestBody ServiceRequest request) {
        return repository.save(request);
    }

    // Retrieve all service requests
    @GetMapping
    public List<ServiceRequest> getAllRequests() {
        return repository.findAll();
    }

    // Update the status of an existing service request
    @PatchMapping("/{id}/status")
    public ServiceRequest updateRequestStatus(
            @PathVariable Long id,
            @RequestParam RequestStatus status) {

        ServiceRequest request = repository.findById(id)
                .orElseThrow(() ->
                        new org.springframework.web.server.ResponseStatusException(
                                HttpStatus.NOT_FOUND,
                                "Service request not found"
                        )
                );

        request.setStatus(status);

        return repository.save(request);
    }
}
