/* This SQL will run before all other queries. */

create role myeyesid_tenant_${database} password '${password}' noinherit;
