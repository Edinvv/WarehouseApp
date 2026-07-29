using MediatR;
using Microsoft.EntityFrameworkCore;
using WarehouseApp.Application.Common.Interfaces;

namespace WarehouseApp.Application.Features.Stock.Queries;

public record StockDto(Guid Id, Guid SectorId, string SectorName, string ProductName, string Barcode, int Quantity);
public record GetStockQuery(Guid? SectorId = null) : IRequest<List<StockDto>>;

public class GetStockQueryHandler : IRequestHandler<GetStockQuery, List<StockDto>>
{
    private readonly IAppDbContext _context;
    public GetStockQueryHandler(IAppDbContext context) => _context = context;

    public async Task<List<StockDto>> Handle(GetStockQuery request, CancellationToken cancellationToken)
    {
        var query = _context.Stock.Include(s => s.Sector).AsQueryable();

        if (request.SectorId.HasValue)
            query = query.Where(s => s.SectorId == request.SectorId.Value);

        return await query
            .Where(s => s.Quantity > 0)
            .OrderBy(s => s.SectorId).ThenBy(s => s.ProductName)
            .Select(s => new StockDto(s.Id, s.SectorId, s.Sector.Name, s.ProductName, s.Barcode, s.Quantity))
            .ToListAsync(cancellationToken);
    }
}