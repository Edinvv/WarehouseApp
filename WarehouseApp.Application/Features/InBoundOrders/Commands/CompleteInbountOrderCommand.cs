using MediatR;
using Microsoft.EntityFrameworkCore;
using WarehouseApp.Application.Common.Interfaces;
using WarehouseApp.Domain.Enums;
using TaskStatus = WarehouseApp.Domain.Enums.TaskStatus;

namespace WarehouseApp.Application.Features.InBoundOrders.Commands;

public enum CompleteOrderResult { Success, NotFound, TasksNotComplete }
public record CompleteInboundOrderCommand(Guid OrderId) : IRequest<CompleteOrderResult>;
public class CompleteInboundOrderCommandHandler : IRequestHandler<CompleteInboundOrderCommand, CompleteOrderResult>

{
    private readonly IAppDbContext _context;
    public CompleteInboundOrderCommandHandler(IAppDbContext context)
    {
        _context = context;
    }
    public async Task<CompleteOrderResult> Handle(CompleteInboundOrderCommand request, CancellationToken cancellationToken)
    {
        var result = await _context.InboundOrders.FirstOrDefaultAsync(o => o.Id == request.OrderId, cancellationToken);
        if (result is null)
        {
            return CompleteOrderResult.NotFound;
        }
        var allDone = await _context.WarehouseTasks
    .Where(t => t.InboundOrderId == request.OrderId)
    .AllAsync(t => t.Status == TaskStatus.Done, cancellationToken);
        if (!allDone)
        {
            return CompleteOrderResult.TasksNotComplete;
        }
        result.Status = InboundOrderStatus.Received;
        var items = await _context.InboundOrderItems
    .Where(i => i.InboundOrderId == request.OrderId)
    .ToListAsync(cancellationToken);

foreach (var item in items)
{
    var existing = await _context.Stock.FirstOrDefaultAsync(
        s => s.SectorId == item.SectorId && s.ProductName == item.ProductName,
        cancellationToken);

    if (existing != null)
        existing.Quantity += item.Quantity;
    else
        _context.Stock.Add(new WarehouseApp.Domain.Entities.Stock
        {
            Id = Guid.NewGuid(),
            SectorId = item.SectorId,
            ProductName = item.ProductName,
            Barcode = item.Barcode,
            Quantity = item.Quantity,
        });
}
        await _context.SaveChangesAsync(cancellationToken);
        return CompleteOrderResult.Success;
    }

}
