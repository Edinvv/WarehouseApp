namespace WarehouseApp.Application.DTOs;

public record OutboundOrderItemDto(Guid Id, string ProductName, int Quantity, string Barcode, Guid SectorId, string SectorName);
public record OutboundOrderDto(Guid Id, string RestaurantName, string Status, DateTime CreatedAt, List<OutboundOrderItemDto> Items);