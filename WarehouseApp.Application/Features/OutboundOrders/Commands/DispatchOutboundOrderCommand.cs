using MediatR;
using Microsoft.EntityFrameworkCore;
using WarehouseApp.Application.Common.Interfaces;
using WarehouseApp.Domain.Enums;
using TaskStatus = WarehouseApp.Domain.Enums.TaskStatus;

namespace WarehouseApp.Application.Features.OutboundOrders.Commands;

public record DispatchOutboundOrderCommand(Guid OrderId) : IRequest<bool>;

public class DispatchOutboundOrderCommandHandler : IRequestHandler<DispatchOutboundOrderCommand, bool>
{
    private readonly IAppDbContext _context;
    public DispatchOutboundOrderCommandHandler(IAppDbContext context) => _context = context;

    public async Task<bool> Handle(DispatchOutboundOrderCommand request, CancellationToken cancellationToken)
    {
        var order = await _context.OutboundOrders
            .FirstOrDefaultAsync(o => o.Id == request.OrderId, cancellationToken);

        if (order is null) return false;

        var allDone = await _context.WarehouseTasks
            .Where(t => t.OutboundOrderId == request.OrderId)
            .AllAsync(t => t.Status == TaskStatus.Done, cancellationToken);

        if (!allDone) return false;

        order.Status = OutboundOrderStatus.Dispatched;
        var items = await _context.OutboundOrderItems
    .Where(i => i.OutboundOrderId == request.OrderId)
    .ToListAsync(cancellationToken);

foreach (var item in items)
{
    var stock = await _context.Stock.FirstOrDefaultAsync(
        s => s.SectorId == item.SectorId && s.ProductName == item.ProductName,
        cancellationToken);

    if (stock != null)
        stock.Quantity = Math.Max(0, stock.Quantity - item.Quantity);
}
        await _context.SaveChangesAsync(cancellationToken);
        return true;
    }
}