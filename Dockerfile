FROM mcr.microsoft.com/mssql/server:2022-latest

# Set environment variables for SQL Server
ENV ACCEPT_EULA=Y
ENV SA_PASSWORD=YourStrong!Passw0rd
ENV MSSQL_PID=Developer

# Switch to root user to perform setup tasks
USER root

# Create directory for initialization scripts
RUN mkdir -p /opt/mssql-scripts

# Copy initialization scripts
COPY docker/init-db.sql /opt/mssql-scripts/
COPY docker/entrypoint.sh /opt/mssql-scripts/

# Make entrypoint script executable and set proper ownership
RUN chmod +x /opt/mssql-scripts/entrypoint.sh && \
    chown -R mssql:mssql /opt/mssql-scripts

# Switch back to mssql user
USER mssql

# Expose SQL Server port
EXPOSE 1433

# Use custom entrypoint to initialize database
ENTRYPOINT ["/opt/mssql-scripts/entrypoint.sh"]