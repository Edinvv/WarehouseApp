

namespace WarehouseApp.Application.DTOs;

    public record TaskItemDto( Guid Id,string ProductName, int Quantity, bool IsCompleted, string Barcode);

