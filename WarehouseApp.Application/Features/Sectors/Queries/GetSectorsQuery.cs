using MediatR;
using Microsoft.EntityFrameworkCore;
using WarehouseApp.Application.Common.Interfaces;
using WarehouseApp.Application.DTOs;

namespace WarehouseApp.Application.Features.Sectors.Queries;

public record GetSectorsQuery : IRequest<List<SectorDto>>;

public class GetSectorsQueryHandler : IRequestHandler<GetSectorsQuery, List<SectorDto>>
{
    private readonly IAppDbContext _context;

    public GetSectorsQueryHandler(IAppDbContext context)
    {
        _context = context;
    }

    public async Task<List<SectorDto>> Handle(GetSectorsQuery request, CancellationToken cancellationToken)
    {
        return await _context.Sectors
            .Select(s => new SectorDto(s.Id, s.Name, s.Description))
            .ToListAsync(cancellationToken);
    }
}