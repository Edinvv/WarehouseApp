

namespace WarehouseApp.Application.DTOs;

public record InboundOrderItemDto(
    Guid Id,
    string ProductName,
    string Barcode,
    int Quantity,
    int MinimumQuantity,
    Guid SectorId
);
    public record InboundOrderDto
    (
        Guid Id,
        string SupplierName,
        string Status,
        string CreatedById,
        string? ReviewedById,
        DateTime CreatedAt,
        List<InboundOrderItemDto> Items

    );
