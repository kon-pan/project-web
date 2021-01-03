const getRequestsGroupByMethod = async () => {
  const res = await fetch(
    `http://${location.host}/admin/get-requests/group-by/method`
  );
  const data = await res.json();

  drawRequestsMethodChart(data);
};

const drawRequestsMethodChart = (data) => {
  let chartLabels = [];
  let chartData = [];
  for (const elem of data) {
    chartLabels.push(elem.method);
    chartData.push(elem.request_count);
  }

  var ctx = document.getElementById('requests-method-chart');
  var requestMethodChart = new Chart(ctx, {
    type: 'horizontalBar',
    data: {
      labels: chartLabels,
      datasets: [
        {
          label: '# of Votes',
          data: chartData,
          backgroundColor: [
            'rgba(255, 99, 132, 0.2)',
            'rgba(54, 162, 235, 0.2)',
            'rgba(255, 206, 86, 0.2)',
            'rgba(75, 192, 192, 0.2)',
            'rgba(153, 102, 255, 0.2)',
            'rgba(255, 159, 64, 0.2)',
          ],
          borderColor: [
            'rgba(255, 99, 132, 1)',
            'rgba(54, 162, 235, 1)',
            'rgba(255, 206, 86, 1)',
            'rgba(75, 192, 192, 1)',
            'rgba(153, 102, 255, 1)',
            'rgba(255, 159, 64, 1)',
          ],
          borderWidth: 1,
        },
      ],
    },
    options: {
      scales: {
        yAxes: [
          {
            ticks: {
              beginAtZero: true,
            },
          },
        ],
      },
    },
  });
};

// Starting point
getRequestsGroupByMethod();
