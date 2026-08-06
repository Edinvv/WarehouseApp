FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

COPY WarehouseApp.Domain/WarehouseApp.Domain.csproj WarehouseApp.Domain/
COPY WarehouseApp.Application/WarehouseApp.Application.csproj WarehouseApp.Application/
COPY WarehouseApp.Infrastructure/WarehouseApp.Infrastructure.csproj WarehouseApp.Infrastructure/
COPY WarehouseApp.API/WarehouseApp.API.csproj WarehouseApp.API/

RUN dotnet restore WarehouseApp.API/WarehouseApp.API.csproj

COPY WarehouseApp.Domain/ WarehouseApp.Domain/
COPY WarehouseApp.Application/ WarehouseApp.Application/
COPY WarehouseApp.Infrastructure/ WarehouseApp.Infrastructure/
COPY WarehouseApp.API/ WarehouseApp.API/

RUN dotnet publish WarehouseApp.API/WarehouseApp.API.csproj -c Release -o /app/publish

FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS final
WORKDIR /app
COPY --from=build /app/publish .

ENV DOTNET_USE_POLLING_FILE_WATCHER=1

ENTRYPOINT ["dotnet", "WarehouseApp.API.dll"]
