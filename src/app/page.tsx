export default function HomePage() {
  return (
    <main>
      <section aria-labelledby="page-title">
        <p>I Got Hungry</p>
        <h1 id="page-title">Good food is already being talked about.</h1>
        <p>Find nearby restaurants through fresh public Instagram recommendations.</p>
        <button type="button">Find food near me</button>
        <label htmlFor="area">City or neighborhood</label>
        <input id="area" name="area" placeholder="Try Brooklyn or Logan Square" />
      </section>
    </main>
  );
}
