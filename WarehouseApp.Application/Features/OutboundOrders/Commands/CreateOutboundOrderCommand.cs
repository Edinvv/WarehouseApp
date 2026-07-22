using MediatR;
using WarehouseApp.Application.Common.Interfaces;
using WarehouseApp.Domain.Entities;

namespace WarehouseApp.Application.Features.OutboundOrders.Commands;

public record OutboundOrderItemRequest(string ProductName, int Quantity, string Barcode, Guid SectorId);
public record CreateOutboundOrderCommand(string RestaurantName, List<OutboundOrderItemRequest> Items, string? CallerUserId) : IRequest<Guid>;

public class CreateOutboundOrderCommandHandler : IRequestHandler<CreateOutboundOrderCommand, Guid>
{
    private readonly IAppDbContext _context;
    public CreateOutboundOrderCommandHandler(IAppDbContext context) => _context = context;

    public async Task<Guid> Handle(CreateOutboundOrderCommand request, CancellationToken cancellationToken)
    {
        var order = new OutboundOrder
        {
            Id = Guid.NewGuid(),
            RestaurantName = request.RestaurantName,
            CreatedById = request.CallerUserId,
            CreatedAt = DateTime.UtcNow,
        };

        foreach (var item in request.Items)
        {
            order.Items.Add(new OutboundOrderItem
            {
                Id = Guid.NewGuid(),
                ProductName = item.ProductName,
                Quantity = item.Quantity,
                Barcode = item.Barcode,
                SectorId = item.SectorId,
            });
        }

        _context.OutboundOrders.Add(order);
        await _context.SaveChangesAsync(cancellationToken);
        return order.Id;
    }
}