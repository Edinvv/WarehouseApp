

namespace WarehouseApp.Application.DTOs;

    public record ProductDto(
        Guid Id, 
        string Name,
        int Quantity,
        int MinimumStock,
        bool IsLowStock );
    
