export default function Hero({ onShop }) {
  return (
    <section className="hero">
      <div className="hero-content">
        <div className="hero-label">DISTRIBUTED ECOMMERCE</div>

        <h1>A production-style
          distributed systems platform.</h1>

        <p>
          Distributed ecommerce platform showcasing resilient REST APIs, loosely coupled microservices, synchronous and asynchronous inter-service communication, event-driven email notifications, API Gateway routing, Kafka-driven workflows, OAuth2/JWT security, social authentication, isolated SQL databases, S3 object storage, and Dockerized deployments.
        </p>

        <div className="hero-actions">

          <button className="shop-button" type="button" onClick={onShop}>
            Shop now
          </button>

          <br>
          </br>



          <button
            type="button"
            className="workflow-link"
            onClick={() => {
              window.location.href = "/workflow.html";
            }}
          >
            Explore System Architecture &amp; Workflow &rarr;
          </button>

        </div>


      </div>
    </section >
  );
}
