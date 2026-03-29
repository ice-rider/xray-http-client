import { createSignal, For, createEffect } from 'solid-js';
import { useQuery, useMutation, useQueryClient } from '@tanstack/solid-query';
import { getClients, createClient, getStats, logout, getServerConfig } from '../api';
import type { ClientStats, CreateClientResponse, ServerConfigResponse } from '../types';

export default function Dashboard() {
  const queryClient = useQueryClient();
  const [showModal, setShowModal] = createSignal(false);
  const [newClientName, setNewClientName] = createSignal('');
  const [newClientFlow, setNewClientFlow] = createSignal('xtls-rprx-vision');
  const [createdLink, setCreatedLink] = createSignal('');
  const [errorMessage, setErrorMessage] = createSignal<string>('');
  const [serverConfig, setServerConfig] = createSignal<ServerConfigResponse | null>(null);

  // Загрузка конфигурации сервера при монтировании
  createEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      getServerConfig().then(setServerConfig).catch(console.error);
    }
  });

  const clientsQuery = useQuery(() => ({
    queryKey: ['clients'],
    queryFn: getClients,
  }));

  const statsQuery = useQuery(() => ({
    queryKey: ['stats'],
    queryFn: getStats,
    refetchInterval: 5000,
  }));

  const createMutation = useMutation(() => ({
    mutationFn: createClient,
    onSuccess: (data: CreateClientResponse) => {
      console.log('Client created successfully:', data);
      setCreatedLink(data.link);
      setNewClientName('');
      setNewClientFlow('xtls-rprx-vision');
      setShowModal(false);
      setErrorMessage('');
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      queryClient.invalidateQueries({ queryKey: ['stats'] });
    },
    onError: (error: any) => {
      console.error('Mutation error:', error);
      const message = error?.message || error?.toString() || 'Неизвестная ошибка';
      setErrorMessage(message);
    },
  }));

  function handleCreateClient(e: Event) {
    e.preventDefault();
    if (!newClientName()) return;
    setErrorMessage('');
    createMutation.mutate({
      flow: newClientFlow(),
      client_name: newClientName(),
    });
  }

  function handleLogout() {
    logout();
    window.location.href = '/login';
  }

  function formatBytes(bytes: number): string {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  function getStatsForClient(email: string): ClientStats | undefined {
    return statsQuery.data?.clients.find((c) => c.email === email);
  }

  function copyToClipboard(text: string) {
    navigator.clipboard.writeText(text);
    alert('Ссылка скопирована в буфер обмена');
  }

  function generateVlessLink(clientId: string, flow: string, clientName: string): string {
    const config = serverConfig();
    if (!config) {
      return `vless://${clientId}@${window.location.hostname}:443?encryption=none&flow=${flow}&security=reality&sni=www.apple.com&fp=firefox&pbk=LOADING&sid=&pqv=`;
    }

    const shortId = config.short_ids && config.short_ids.length > 0 ? config.short_ids[0] : '';
    const serverIP = config.server_ip || window.location.hostname;
    
    const params = new URLSearchParams({
      encryption: 'none',
      flow: flow,
      security: 'reality',
      sni: config.sni || 'www.apple.com',
      fp: config.fingerprint || 'firefox',
      pbk: config.public_key,
      sid: shortId,
      pqv: config.mldsa65_public,
    });

    return `vless://${clientId}@${serverIP}:${config.port}?${params.toString()}#${encodeURIComponent(clientName)}`;
  }

  // Отображаем ошибку если есть
  const error = clientsQuery.error || statsQuery.error;
  if (error) {
    const errMsg = error instanceof Error ? error.message : String(error);
    console.error('Query error:', errMsg);
    return (
      <div class="dashboard">
        <header class="header">
          <h1>Xray Manager</h1>
          <button onClick={handleLogout} class="btn btn-secondary">Выйти</button>
        </header>
        <main class="main">
          <div class="error">
            <h3>Ошибка загрузки данных</h3>
            <p>{errMsg}</p>
            <button onClick={() => {
              clientsQuery.refetch();
              statsQuery.refetch();
            }} class="btn btn-primary">
              Повторить
            </button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div class="dashboard">
      <header class="header">
        <h1>Xray Manager</h1>
        <button onClick={handleLogout} class="btn btn-secondary">
          Выйти
        </button>
      </header>

      <main class="main">
        <div class="controls">
          <button
            onClick={() => {
              setShowModal(true);
              setCreatedLink('');
              setErrorMessage('');
              createMutation.reset();
            }}
            class="btn btn-primary"
          >
            + Добавить клиента
          </button>
        </div>

        {clientsQuery.isLoading || statsQuery.isLoading ? (
          <div class="loading">Загрузка...</div>
        ) : (
          <div class="clients-table">
            <table>
              <thead>
                <tr>
                  <th>Email</th>
                  <th>ID</th>
                  <th>Flow</th>
                  <th>Трафик (вверх / вниз)</th>
                  <th>Всего</th>
                  <th>Действия</th>
                </tr>
              </thead>
              <tbody>
                <For each={clientsQuery.data?.clients}>
                  {(client) => {
                    const stats = getStatsForClient(client.email);
                    const link = generateVlessLink(client.id, client.flow, client.email);
                    return (
                      <tr>
                        <td>{client.email}</td>
                        <td class="mono">{client.id}</td>
                        <td>{client.flow}</td>
                        <td>
                          {stats
                            ? `${formatBytes(stats.uplink)} / ${formatBytes(stats.downlink)}`
                            : '0 B / 0 B'}
                        </td>
                        <td>{stats ? formatBytes(stats.total) : '0 B'}</td>
                        <td>
                          <button
                            onClick={() => copyToClipboard(link)}
                            class="btn btn-small"
                          >
                            Копировать ссылку
                          </button>
                          <input
                            style={{"user-select":"all", "width": "100%", "margin-top": "4px"}}
                            value={link}
                            readOnly
                          />
                        </td>
                      </tr>
                    );
                  }}
                </For>
              </tbody>
            </table>
          </div>
        )}
      </main>

      {showModal() && (
        <div class="modal-overlay" onClick={() => setShowModal(false)}>
          <div class="modal" onClick={(e) => e.stopPropagation()}>
            <h2>Добавить клиента</h2>
            <form onSubmit={handleCreateClient}>
              <div class="form-group">
                <label for="clientName">Имя клиента</label>
                <input
                  id="clientName"
                  type="text"
                  value={newClientName()}
                  onInput={(e) => setNewClientName(e.currentTarget.value)}
                  placeholder="my-client"
                  required
                />
              </div>

              <div class="form-group">
                <label for="flow">Flow</label>
                <select
                  id="flow"
                  value={newClientFlow()}
                  onChange={(e) => setNewClientFlow(e.currentTarget.value)}
                >
                  <option value="xtls-rprx-vision">xtls-rprx-vision</option>
                  <option value="xtls-rprx-vision-udp443">
                    xtls-rprx-vision-udp443
                  </option>
                  <option value="">none</option>
                </select>
              </div>

              {createMutation.isPending && (
                <div class="loading">Создание...</div>
              )}

              {errorMessage() && (
                <div class="error">
                  <strong>Ошибка:</strong> {errorMessage()}
                </div>
              )}

              {createMutation.error && !errorMessage() && (
                <div class="error">
                  <strong>Ошибка:</strong> {String(createMutation.error)}
                </div>
              )}

              {createdLink() && (
                <div class="success">
                  <p>✓ Клиент успешно создан!</p>
                  <div class="link-box">
                    <code>{createdLink()}</code>
                    <button
                      type="button"
                      onClick={() => copyToClipboard(createdLink())}
                      class="btn btn-small"
                    >
                      Копировать
                    </button>
                  </div>
                </div>
              )}

              <div class="modal-actions">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    createMutation.reset();
                    setCreatedLink('');
                    setErrorMessage('');
                  }}
                  class="btn btn-secondary"
                  disabled={createMutation.isPending}
                >
                  Закрыть
                </button>
                <button
                  type="submit"
                  class="btn btn-primary"
                  disabled={createMutation.isPending || !newClientName()}
                >
                  Создать
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
